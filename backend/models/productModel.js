const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    tag: { type: String },
    description: { type: String },
    variants: { type: Object },
    reviews: { type: Number, default: 0 },
    images: [{ type: String }],
    benefits: [{
        id: Number,
        icon: String,
        text: String
    }],
    details: {
        essenceQuote: String,
        essenceDesc: String,
        ingredients: [{ name: String, image: String }],
        nutrition: [{ label: String, value: String }],
        reviewsData: [{ name: String, quote: String, stars: Number, initial: String, published: { type: Boolean, default: true } }],
        relatedData: [{ title: String, desc: String, price: String, image: String }]
    }
}, {
    timestamps: true
});

// Compound Text Index for ultra-fast full-text product search queries
productSchema.index({ title: 'text', tag: 'text', description: 'text' }, { weights: { title: 10, tag: 5, description: 1 } });

productSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
