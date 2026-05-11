const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestId: { type: String }, // For non-logged in users
    type: { 
        type: String, 
        enum: ['Visit', 'AddToCart', 'CheckoutStart', 'Purchase', 'Refund', 'Cancel', 'Signup', 'Login', 'Logout'],
        required: true 
    },
    page: { type: String },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    amount: { type: Number },
    metadata: { type: mongoose.Schema.Types.Mixed },
    userAgent: { type: String },
    ip: { type: String }
}, { timestamps: true });

// Index for fast analytics queries
eventSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Event', eventSchema);
