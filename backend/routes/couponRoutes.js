const express = require('express');
const { 
    validateCoupon, 
    getCoupons, 
    createCoupon, 
    updateCoupon, 
    deleteCoupon 
} = require('../controllers/couponController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public validation route (requires logged in user)
router.post('/validate', verifyToken, validateCoupon);

// Admin-only CRUD routes
router.get('/', verifyToken, verifyAdmin, getCoupons);
router.post('/', verifyToken, verifyAdmin, createCoupon);
router.put('/:id', verifyToken, verifyAdmin, updateCoupon);
router.delete('/:id', verifyToken, verifyAdmin, deleteCoupon);

module.exports = router;
