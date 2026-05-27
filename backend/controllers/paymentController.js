const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Address = require('../models/addressModel');
const User = require('../models/userModel');
const Coupon = require('../models/couponModel');
const { validateCouponCodeHelper } = require('./couponController');
const { sendOrderEmail } = require('../utils/emailService');
const { recordInternalEvent } = require('./analyticsController');
const { serializeOrder, serializeCartItemsForOrder, serializeAddressForOrder } = require('../serializers');

// ─── Razorpay Credentials ──────────────────────────────────────────────
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.warn('WARNING: Razorpay credentials missing in .env.');
}

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

// ─── Shared Helpers ────────────────────────────────────────────────────

/** Compute subtotal, coupon discount, delivery fee, and final total. */
const computeTotals = async (items, couponCode = null) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
        if (coupon) {
            const validation = validateCouponCodeHelper(coupon, items, subtotal);
            if (validation.success) {
                discountAmount = validation.discountAmount;
                appliedCouponCode = coupon.code;
            }
        }
    }

    const discountedSubtotal = subtotal - discountAmount;
    const deliveryFee = subtotal > 500 ? 0 : 49;
    const finalTotal = discountedSubtotal + deliveryFee;

    return { 
        subtotal, 
        discountAmount, 
        deliveryFee, 
        finalTotal: finalTotal > 0 ? finalTotal : 0,
        couponCode: appliedCouponCode 
    };
};

/**
 * Generate a unique Business Order ID.
 * Uses last-6 digits of timestamp + 4-digit random — no DB roundtrip needed.
 * e.g. ORD-4569431042
 */
const generateOrderId = () => {
    const ts = Date.now().toString().slice(-6);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${ts}${rand}`;
};

// ─── Controllers ───────────────────────────────────────────────────────

/**
 * @desc    Create Razorpay Order (to initiate checkout)
 * @route   POST /api/payment/create-order
 */
const createRazorpayOrder = async (req, res) => {
    const { couponCode } = req.body;
    try {
        // .lean() → plain JS object, skips Mongoose hydration overhead
        const cart = await Cart.findOne({ userId: req.user.id }).lean();
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty.' });
        }

        const { finalTotal } = await computeTotals(cart.items, couponCode);
        const amountInPaise = Math.round(finalTotal * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${req.user.id.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,
            notes: { userId: req.user.id, couponCode: couponCode || '' }
        });

        return res.status(200).json({
            success: true,
            orderId: order.id,
            amount: amountInPaise,
            currency: order.currency,
            keyId: RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error('[Razorpay] Order creation failed:', err.message);
        return res.status(500).json({ success: false, message: 'Payment initiation failed.' });
    }
};

/**
 * @desc    Verify Razorpay payment signature and save order
 * @route   POST /api/payment/verify
 */
const verifyAndPlaceOrder = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, addressId, couponCode } = req.body;

    // 1. Verify signature (CPU-only — no DB hit)
    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed. Possible fraud.' });
    }

    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // 2. Fetch cart + address in parallel
        const [cart, address] = await Promise.all([
            Cart.findOne({ userId }).lean(),
            Address.findOne({ _id: addressId, userId }).lean()
        ]);

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty. Cannot place order.' });
        }
        if (!address) {
            return res.status(404).json({ success: false, message: 'Delivery address not found.' });
        }

        const totals = await computeTotals(cart.items, couponCode);

        // 3. Create order + clear cart in parallel
        const [order] = await Promise.all([
            Order.create({
                orderId: generateOrderId(),
                userId,
                items: serializeCartItemsForOrder(cart.items),
                address: serializeAddressForOrder(address),
                amount: totals.finalTotal,
                discountAmount: totals.discountAmount,
                couponCode: totals.couponCode,
                paymentMethod: 'Razorpay',
                paymentId: razorpay_payment_id,
                status: 'Order Placed'
            }),
            Cart.updateOne({ userId }, { $set: { items: [] } })
        ]);

        // Increment coupon count
        if (totals.couponCode) {
            await Coupon.updateOne({ code: totals.couponCode }, { $inc: { usedCount: 1 } });
        }

        // Send confirmation email in background
        User.findById(userId).then(user => {
            if (user) sendOrderEmail(user, order, 'confirmation');
        });

        // Analytics
        recordInternalEvent({ userId, type: 'Purchase', amount: order.amount, metadata: { orderId: order.orderId } });

        return res.status(201).json({
            success: true,
            message: '🎉 Payment successful! Order placed.',
            order: serializeOrder(order)
        });
    } catch (err) {
        console.error('[Razorpay] Order placement failed:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to complete order.' });
    }
};

/**
 * @desc    Place order with Cash on Delivery
 * @route   POST /api/payment/cod
 */
const placeCODOrder = async (req, res) => {
    const { addressId, couponCode } = req.body;

    if (!req.user?.id) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // 1. Fetch cart + address in parallel (lean = no Mongoose hydration)
        const [cart, address] = await Promise.all([
            Cart.findOne({ userId }).lean(),
            Address.findOne({ _id: addressId, userId }).lean()
        ]);

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty. Cannot place order.' });
        }
        if (!address) {
            return res.status(404).json({ success: false, message: 'Delivery address not found or unauthorized.' });
        }

        const totals = await computeTotals(cart.items, couponCode);

        // 2. Create order + clear cart in parallel
        const [order] = await Promise.all([
            Order.create({
                orderId: generateOrderId(),
                userId,
                items: serializeCartItemsForOrder(cart.items),
                address: serializeAddressForOrder(address),
                amount: totals.finalTotal,
                discountAmount: totals.discountAmount,
                couponCode: totals.couponCode,
                paymentMethod: 'COD',
                status: 'Order Placed'
            }),
            Cart.updateOne({ userId }, { $set: { items: [] } })
        ]);

        // Increment coupon count
        if (totals.couponCode) {
            await Coupon.updateOne({ code: totals.couponCode }, { $inc: { usedCount: 1 } });
        }

        // Send confirmation email in background
        User.findById(userId).then(user => {
            if (user) sendOrderEmail(user, order, 'confirmation');
        });

        console.log(`[COD] Order ${order.orderId} placed for user ${userId}`);

        return res.status(201).json({
            success: true,
            message: '🎉 Order placed successfully! Cash on Delivery.',
            order: serializeOrder(order)
        });
    } catch (err) {
        console.error('[COD] Order placement failed:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to place COD order.', error: err.message });
    }
};

module.exports = { createRazorpayOrder, verifyAndPlaceOrder, placeCODOrder };
