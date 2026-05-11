const express = require('express');
const router = express.Router();
const { trackEvent, getAnalyticsSummary } = require('../controllers/analyticsController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Public route for tracking (supports guest and logged-in)
// Optionally use a custom middleware that doesn't 401 if token missing
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) return verifyToken(req, res, next);
    next();
};

router.post('/track', trackEvent);
router.get('/summary', getAnalyticsSummary);

module.exports = router;
