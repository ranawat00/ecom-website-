const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
    weight: { type: String },
    quantity: { type: Number, default: 1 }
}, { _id: true }); // We keep _id for items to map it to 'itemId'

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

cartSchema.set('toJSON', {
    transform: (doc, ret) => {
        // Map _id to itemId for each item for frontend compatibility
        if (ret.items) {
            ret.items = ret.items.map(item => {
                const mapped = { ...item, itemId: item._id };
                delete mapped._id;
                return mapped;
            });
        }
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
