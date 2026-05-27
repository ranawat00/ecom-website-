const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true, 
        trim: true 
    },
    discountType: { 
        type: String, 
        required: true, 
        enum: ['percentage', 'fixed'] 
    },
    discountValue: { 
        type: Number, 
        required: true 
    },
    minPurchase: { 
        type: Number, 
        default: 0 
    },
    maxDiscount: { 
        type: Number, 
        default: null 
    },
    applicableProducts: [{ 
        type: String // We will store product id (string like productSchema.id) or object reference
    }],
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    usageLimit: { 
        type: Number, 
        default: null 
    },
    usedCount: { 
        type: Number, 
        default: 0 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true
});

couponSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
