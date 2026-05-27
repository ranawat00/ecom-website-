const Product = require('../models/productModel');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().lean();
        const formatted = products.map(product => {
            if (product.details && product.details.reviewsData) {
                const visibleReviews = product.details.reviewsData.filter(rev => rev.published !== false);
                product.reviews = visibleReviews.length;
            }
            return product;
        });
        res.status(200).json({ success: true, products: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching products' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id }).lean();
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        // Filter reviews to show only published/unmoderated ones
        if (product.details && product.details.reviewsData) {
            product.details.reviewsData = product.details.reviewsData.filter(rev => rev.published !== false);
            product.reviews = product.details.reviewsData.length;
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching product' });
    }
};

exports.submitProductReview = async (req, res) => {
    try {
        const { name, quote, stars } = req.body;
        if (!name || !quote || !stars) {
            return res.status(400).json({ success: false, message: 'Name, review comment, and star rating are required.' });
        }

        const product = await Product.findOne({ id: req.params.id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        // Add review to details.reviewsData as published (published: true)
        const reviewObj = {
            name,
            quote,
            stars: parseInt(stars, 10),
            initial: name.charAt(0).toUpperCase(),
            published: true
        };

        if (!product.details) {
            product.details = {
                essenceQuote: '',
                essenceDesc: '',
                ingredients: [],
                nutrition: [],
                reviewsData: [],
                relatedData: []
            };
        }

        if (!product.details.reviewsData) {
            product.details.reviewsData = [];
        }

        product.details.reviewsData.push(reviewObj);
        
        // Save to database
        await product.save();

        res.status(201).json({ 
            success: true, 
            message: '🎉 Review submitted successfully!', 
            review: reviewObj 
        });
    } catch (error) {
        console.error('[ProductReview] Submit failed:', error.message);
        res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
};

/**
 * @desc    Get all products for CRUD manager
 * @route   GET /api/admin/products
 * @access  Private/Admin
 */
exports.getAllProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }).lean();
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error loading products' });
    }
};

/**
 * @desc    Create a new product
 * @route   POST /api/admin/products
 * @access  Private/Admin
 */
exports.createProduct = async (req, res) => {
    try {
        const { id, title, tag, description, variants, images, benefits, details } = req.body;

        if (!id || !title) {
            return res.status(400).json({ success: false, message: 'Product Custom ID and Title are required.' });
        }

        // Check if ID is unique
        const existing = await Product.findOne({ id });
        if (existing) {
            return res.status(409).json({ success: false, message: `Product with custom ID "${id}" already exists.` });
        }

        const newProduct = await Product.create({
            id,
            title,
            tag: tag || '',
            description: description || '',
            variants: variants || {},
            images: images || [],
            benefits: benefits || [],
            details: details || {
                essenceQuote: '',
                essenceDesc: '',
                ingredients: [],
                nutrition: [],
                reviewsData: [],
                relatedData: []
            }
        });

        res.status(201).json({ success: true, message: 'Product created successfully!', product: newProduct });
    } catch (error) {
        console.error('[AdminProduct] Create failed:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
    }
};

/**
 * @desc    Edit an existing product
 * @route   PUT /api/admin/products/:id
 * @access  Private/Admin
 */
exports.editProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const { title, tag, description, variants, images, benefits, details } = req.body;

        if (title) product.title = title;
        if (tag !== undefined) product.tag = tag;
        if (description !== undefined) product.description = description;
        if (variants !== undefined) product.variants = variants;
        if (images !== undefined) product.images = images;
        if (benefits !== undefined) product.benefits = benefits;
        if (details !== undefined) product.details = details;

        await product.save();

        res.status(200).json({ success: true, message: 'Product updated successfully!', product });
    } catch (error) {
        console.error('[AdminProduct] Update failed:', error.message);
        res.status(500).json({ success: false, message: 'Failed to edit product', error: error.message });
    }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/admin/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = async (req, res) => {
    try {
        const result = await Product.findOneAndDelete({ id: req.params.id });
        if (!result) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
};
