const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: String,
        title: String,
        price: Number,
        quantity: Number,
        weight: String,
        image: String
    }],
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Razorpay' },
    paymentId: { type: String },
    address: { type: Object, required: true },
    status: { 
        type: String, 
        enum: ['Order Placed', 'Processing', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Order Placed' 
    }
}, {
    timestamps: true
});

orderSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret.orderId; // Map orderId to id for frontend
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
