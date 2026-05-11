const Product = require('../models/productModel');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching products' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching product' });
    }
};
