const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');
const User = require('../models/userModel');
const { sendOrderEmail } = require('../utils/emailService');
const { recordInternalEvent } = require('./analyticsController');
const { serializeOrder, serializeOrders, serializeCartItemsForOrder, serializeAddressForOrder } = require('../serializers');

/** Compute cart totals. */
const computeTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 500 ? 0 : 49;
    return { subtotal, deliveryFee, finalTotal: subtotal + deliveryFee };
};

/** Generate unique order ID without a countDocuments() DB roundtrip. */
const generateOrderId = () => {
    const ts = Date.now().toString().slice(-6);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${ts}${rand}`;
};

/**
 * @route POST /api/order
 * Body: { addressId, paymentMethod }
 */
const placeOrder = async (req, res) => {
    const { addressId, paymentMethod, directBuyItem } = req.body;

    if (!addressId) {
        return res.status(400).json({ success: false, message: 'Please select a delivery address.' });
    }

    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // Fetch address (and cart only if not direct buy)
        const fetchPromises = [
            Address.findOne({ _id: addressId, userId }).lean()
        ];
        if (!directBuyItem) {
            fetchPromises.push(Cart.findOne({ userId }).lean());
        }

        const [address, cart] = await Promise.all(fetchPromises);

        if (!address) {
            return res.status(404).json({ success: false, message: 'Delivery address not found.' });
        }

        let items = [];
        if (directBuyItem) {
            items = [directBuyItem];
        } else {
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ success: false, message: 'Your cart is empty.' });
            }
            items = cart.items;
        }

        const { finalTotal } = computeTotals(items);

        // Create order + (clear cart ONLY if not direct buy)
        const dbOperations = [
            Order.create({
                orderId: generateOrderId(),
                userId,
                items: serializeCartItemsForOrder(items),
                address: serializeAddressForOrder(address),
                amount: finalTotal,
                paymentMethod: paymentMethod || 'UPI'
            })
        ];

        if (!directBuyItem) {
            dbOperations.push(Cart.updateOne({ userId }, { $set: { items: [] } }));
        }

        const [order] = await Promise.all(dbOperations);

        // Send confirmation email in background
        User.findById(userId).then(user => {
            if (user) sendOrderEmail(user, order, 'confirmation');
        });

        // Analytics
        recordInternalEvent({ userId, type: 'Purchase', amount: order.amount, metadata: { orderId: order.orderId } });

        return res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order: serializeOrder(order)
        });
    } catch (error) {
        console.error('[Order] placeOrder failed:', error.message);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * @route GET /api/order
 */
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({ success: true, orders: serializeOrders(orders) });
    } catch (error) {
        console.error('[Order] getOrders failed:', error.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @route GET /api/order/:id
 */
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            $or: [{ _id: req.params.id }, { orderId: req.params.id }]
        }).lean();

        if (!order || order.userId.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        return res.status(200).json({ success: true, order: serializeOrder(order) });
    } catch (error) {
        console.error('[Order] getOrderById failed:', error.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @route POST /api/order/cancel/:id
 */
const cancelOrder = async (req, res) => {
    try {
        const orderIdParam = req.params.id;
        const userId = new mongoose.Types.ObjectId(req.user.id);

        console.log(`[Order] Attempting to cancel order: ${orderIdParam} for user: ${userId}`);

        const query = { userId };
        if (mongoose.Types.ObjectId.isValid(orderIdParam)) {
            query.$or = [{ _id: orderIdParam }, { orderId: orderIdParam }];
        } else {
            query.orderId = orderIdParam;
        }

        const order = await Order.findOne(query);

        if (!order) {
            console.log(`[Order] Order not found or unauthorized: ${orderIdParam}`);
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Only allow cancellation if order is just placed or processing
        const cancellableStatuses = ['Order Placed', 'Processing'];
        if (!cancellableStatuses.includes(order.status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Order cannot be cancelled as it is already ${order.status.toLowerCase()}.` 
            });
        }

        order.status = 'Cancelled';
        await order.save();

        // Send cancellation email in background
        User.findById(userId).then(user => {
            if (user) sendOrderEmail(user, order, 'cancellation');
        });

        // Analytics
        recordInternalEvent({ userId, type: 'Cancel', amount: order.amount, metadata: { orderId: order.orderId } });

        return res.status(200).json({ 
            success: true, 
            message: 'Order cancelled successfully.',
            order: serializeOrder(order)
        });
    } catch (error) {
        console.error('[Order] cancelOrder failed:', error.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { placeOrder, getOrders, getOrderById, cancelOrder };
