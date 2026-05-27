const Coupon = require('../models/couponModel');

/**
 * Clean & validate coupon and compute discount amount.
 * Can be used in both validation API and order controllers server-side.
 */
const validateCouponCodeHelper = (coupon, cartItems, cartTotal) => {
    const now = new Date();

    if (!coupon.isActive) {
        return { success: false, message: 'This coupon is inactive.' };
    }

    if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
        return { success: false, message: 'This coupon is expired or not yet active.' };
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return { success: false, message: 'This coupon usage limit has been reached.' };
    }

    if (cartTotal < coupon.minPurchase) {
        return { success: false, message: `Minimum purchase of ₹${coupon.minPurchase} is required to apply this coupon.` };
    }

    let discountAmount = 0;

    // Check product restrictions
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
        // Calculate eligible subtotal by filtering cart items
        const eligibleItems = cartItems.filter(item => 
            coupon.applicableProducts.includes(item.productId)
        );

        if (eligibleItems.length === 0) {
            return { success: false, message: 'This coupon is not applicable to any products in your cart.' };
        }

        const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (coupon.discountType === 'percentage') {
            discountAmount = (eligibleSubtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else {
            // Fixed discount
            discountAmount = coupon.discountValue;
            if (discountAmount > eligibleSubtotal) {
                discountAmount = eligibleSubtotal; // Capped by eligible subtotal
            }
        }
    } else {
        // Global coupon
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else {
            discountAmount = coupon.discountValue;
            if (discountAmount > cartTotal) {
                discountAmount = cartTotal; // Capped by total
            }
        }
    }

    return {
        success: true,
        discountAmount: Math.round(discountAmount * 100) / 100,
        couponId: coupon._id
    };
};

/**
 * @desc    Validate a coupon code (For frontend validation)
 * @route   POST /api/coupons/validate
 * @access  Private
 */
const validateCoupon = async (req, res) => {
    const { code, cartItems, cartTotal } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    try {
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
        }

        const result = validateCouponCodeHelper(coupon, cartItems, cartTotal);
        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json({
            success: true,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: result.discountAmount,
            message: 'Coupon code applied successfully!'
        });
    } catch (err) {
        console.error('[CouponValidation] Error:', err);
        return res.status(500).json({ success: false, message: 'Failed to validate coupon code.' });
    }
};

/**
 * @desc    Get all coupons
 * @route   GET /api/coupons
 * @access  Private (Admin only)
 */
const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, coupons });
    } catch (err) {
        console.error('[CouponGet] Error:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
    }
};

/**
 * @desc    Create a new coupon
 * @route   POST /api/coupons
 * @access  Private (Admin only)
 */
const createCoupon = async (req, res) => {
    const { 
        code, 
        discountType, 
        discountValue, 
        minPurchase, 
        maxDiscount, 
        applicableProducts, 
        startDate, 
        endDate, 
        usageLimit, 
        isActive 
    } = req.body;

    if (!code || !discountType || !discountValue || !startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    try {
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: 'A coupon with this code already exists.' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minPurchase: minPurchase || 0,
            maxDiscount: maxDiscount || null,
            applicableProducts: applicableProducts || [],
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            usageLimit: usageLimit || null,
            isActive: isActive !== undefined ? isActive : true
        });

        return res.status(201).json({ success: true, message: 'Coupon created successfully.', coupon });
    } catch (err) {
        console.error('[CouponCreate] Error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create coupon.' });
    }
};

/**
 * @desc    Update an existing coupon
 * @route   PUT /api/coupons/:id
 * @access  Private (Admin only)
 */
const updateCoupon = async (req, res) => {
    const { id } = req.params;
    const { 
        code, 
        discountType, 
        discountValue, 
        minPurchase, 
        maxDiscount, 
        applicableProducts, 
        startDate, 
        endDate, 
        usageLimit, 
        isActive 
    } = req.body;

    try {
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found.' });
        }

        if (code) {
            const existingCoupon = await Coupon.findOne({ code: code.toUpperCase(), _id: { $ne: id } });
            if (existingCoupon) {
                return res.status(400).json({ success: false, message: 'Another coupon with this code already exists.' });
            }
            coupon.code = code.toUpperCase();
        }

        if (discountType) coupon.discountType = discountType;
        if (discountValue !== undefined) coupon.discountValue = discountValue;
        if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
        if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
        if (applicableProducts !== undefined) coupon.applicableProducts = applicableProducts;
        if (startDate) coupon.startDate = new Date(startDate);
        if (endDate) coupon.endDate = new Date(endDate);
        if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
        if (isActive !== undefined) coupon.isActive = isActive;

        await coupon.save();

        return res.status(200).json({ success: true, message: 'Coupon updated successfully.', coupon });
    } catch (err) {
        console.error('[CouponUpdate] Error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update coupon.' });
    }
};

/**
 * @desc    Delete a coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private (Admin only)
 */
const deleteCoupon = async (req, res) => {
    const { id } = req.params;

    try {
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found.' });
        }

        await Coupon.deleteOne({ _id: id });
        return res.status(200).json({ success: true, message: 'Coupon deleted successfully.' });
    } catch (err) {
        console.error('[CouponDelete] Error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
    }
};

module.exports = {
    validateCouponCodeHelper,
    validateCoupon,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon
};
