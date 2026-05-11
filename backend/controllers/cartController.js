const Cart = require('../models/cartModel');
const { serializeCart } = require('../serializers');

/**
 * @route GET /api/cart
 */
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(200).json({ success: true, items: [], total: 0 });
        
        return res.status(200).json(serializeCart(cart));
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @route POST /api/cart
 * Body: { productId, title, price, image, weight, quantity }
 */
const addToCart = async (req, res) => {
    const { productId, title, price, image, weight, quantity } = req.body;
    if (!productId || !title || !price) {
        return res.status(400).json({ success: false, message: 'productId, title, and price are required.' });
    }

    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        const existing = cart.items.find(
            i => i.productId === productId && (!weight || i.weight === weight)
        );

        if (existing) {
            existing.quantity += quantity || 1;
        } else {
            cart.items.push({ productId, title, price, image, weight, quantity: quantity || 1 });
        }

        await cart.save();
        return res.status(200).json({ 
            success: true, 
            message: 'Item added to cart.', 
            ...serializeCart(cart) 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @route PUT /api/cart/:itemId
 * Body: { quantity }
 */
const updateCartItem = async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    try {
        console.log(`[CART] Update Request - Item: ${itemId}, Target Qty: ${quantity}`);
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        if (quantity <= 0) {
            cart.items = cart.items.filter(i => i._id.toString() !== itemId);
        } else {
            const item = cart.items.id(itemId);
            if (item) item.quantity = quantity;
        }

        await cart.save();
        return res.status(200).json({ 
            success: true, 
            ...serializeCart(cart) 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @route DELETE /api/cart/:itemId
 */
const removeFromCart = async (req, res) => {
    const { itemId } = req.params;

    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        cart.items = cart.items.filter(i => i._id.toString() !== itemId);
        await cart.save();

        return res.status(200).json({ 
            success: true, 
            message: 'Item removed.', 
            ...serializeCart(cart) 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @route DELETE /api/cart
 */
const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });
        return res.status(200).json({ success: true, message: 'Cart cleared.', items: [], total: 0 });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
