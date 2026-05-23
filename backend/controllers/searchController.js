const Product = require('../models/productModel');

// Static Support Articles (moved from frontend to backend for global searchability)
const supportArticles = [
    { id: 1, type: 'support', title: 'How to track my order?', content: 'To track your order, visit the "Order History" section in your profile dashboard. Once your postpartum wellness kit is shipped, a real-time tracking link will be sent to your mobile number and email.', link: '/help' },
    { id: 2, type: 'support', title: 'Shipping information and timelines', content: 'We offer domestic shipping across India. Standard delivery takes 3-5 business days. For remote locations, it may take up to 7 days.', link: '/help' },
    { id: 3, type: 'support', title: 'Payment methods and security', content: 'We accept all major credit cards, debit cards, UPI (GPay, PhonePe), and Net Banking. All transactions are secured with Razorpay.', link: '/help' },
    { id: 4, type: 'support', title: 'How to reset my password or update account details?', content: 'If you forgot your password, click the "Forgot Password" link on the login modal. To update your profile, click user icon > Profile Details.', link: '/help' },
    { id: 5, type: 'support', title: 'International shipping availability', content: 'Currently, we only deliver within India. We are working hard to bring our heritage products to international markets soon.', link: '/help' },
    { id: 6, type: 'support', title: 'How to cancel my order?', content: 'You can cancel your order within 2 hours of placement directly from the "Order History" section. Once the order enters packaging, cancellation is not possible.', link: '/help' },
    { id: 7, type: 'support', title: 'Refund policy and timeline', content: 'Once a refund is initiated, it typically takes 5-7 business days to reflect in your original payment method.', link: '/help' },
    { id: 8, type: 'support', title: 'How to change delivery address?', content: 'You can update your shipping address in the "Saved Addresses" section of your profile before the order is processed.', link: '/help' },
    { id: 9, type: 'support', title: 'Bulk orders and corporate gifting', content: 'For bulk inquiries or custom gifting solutions, please connect with us via the contact form or email support@maaposhan.com.', link: '/help' },
    { id: 10, type: 'support', title: 'How to connect with the support team?', content: 'Connect with our support team via Live Chat, Email (support@maaposhan.com), or Phone (+91 078200 50723). Available Mon-Sat, 9AM-7PM.', link: '/help' }
];

exports.globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(200).json({ success: true, results: [] });
        }

        const keywords = q.toLowerCase().split(' ').filter(k => k.trim());
        
        // 1. Search Products
        const products = await Product.find({});
        const filteredProducts = products.filter(p => {
            const searchStr = (p.title + ' ' + p.description + ' ' + p.tag).toLowerCase();
            return keywords.every(kw => searchStr.includes(kw));
        }).map(p => ({
            id: p.id,
            type: 'product',
            title: p.title,
            description: p.description,
            image: p.images[0],
            link: `/product/${p.id}`,
            price: p.variants && Object.values(p.variants)[0] ? Object.values(p.variants)[0].price : null
        }));

        // 2. Search Support Articles
        const filteredSupport = supportArticles.filter(a => {
            const searchStr = (a.title + ' ' + a.content).toLowerCase();
            return keywords.every(kw => searchStr.includes(kw));
        });

        // Combine Results
        const allResults = [...filteredProducts, ...filteredSupport];

        res.status(200).json({
            success: true,
            query: q,
            count: allResults.length,
            results: allResults
        });
    } catch (err) {
        console.error('Global Search Error:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
