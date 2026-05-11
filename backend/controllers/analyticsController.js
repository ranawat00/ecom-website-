const Event = require('../models/eventModel');

/**
 * Record a user event
 */
exports.trackEvent = async (req, res) => {
    const { type, page, productId, amount, metadata, guestId } = req.body;
    let userId = null;

    // Manually check for token if available to link user
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'secret');
            userId = decoded.id;
        } catch (e) {
            // Token invalid or expired - track as guest
        }
    }
    
    try {
        await Event.create({
            userId: userId || (req.user ? req.user.id : null),
            guestId: guestId || req.headers['x-guest-id'],
            type,
            page,
            productId,
            amount,
            metadata,
            userAgent: req.headers['user-agent'],
            ip: req.ip
        });

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('[Analytics] Failed to track event:', err.message);
        // Fail silently for user experience
        res.status(200).json({ success: true });
    }
};

/**
 * Internal system tracking (for use from other controllers)
 */
exports.recordInternalEvent = async (data) => {
    try {
        await Event.create({
            ...data,
            userAgent: 'SSR/System'
        });
    } catch (err) {
        console.error('[Analytics] Internal tracking failed:', err.message);
    }
    console.log(`[Analytics] Internal event recorded: ${data.type}`);
};

/**
 * Get basic analytics summary for Admin Dashboard
 */
exports.getAnalyticsSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);

        const visitsToday = await Event.countDocuments({ type: 'Visit', createdAt: { $gte: today } });
        const ordersToday = await Event.countDocuments({ type: 'Purchase', createdAt: { $gte: today } });
        
        // Simple Conversion Rate
        const conversionRate = visitsToday > 0 ? (ordersToday / visitsToday) * 100 : 0;

        // Recent activity
        const recentEvents = await Event.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'username email');

        res.json({
            success: true,
            visitsToday,
            ordersToday,
            conversionRate: conversionRate.toFixed(2),
            recentEvents
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
