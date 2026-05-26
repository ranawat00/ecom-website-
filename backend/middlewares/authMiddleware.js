const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jaggry_super_secret_key_123';

/**
 * Middleware to verify JWT token on protected routes
 */
const verifyToken = (req, res, next) => {
    // Get token from header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    // Extract the token string
    const token = authHeader.split(' ')[1];

    try {
        // Verify the token validity
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user payload to request
        next(); // Proceed to the specific route controller
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

/**
 * Middleware to verify that the logged-in user is an Admin
 */
const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Administrative permissions required.'
        });
    }
};

module.exports = {
    verifyToken,
    verifyAdmin,
    JWT_SECRET
};
