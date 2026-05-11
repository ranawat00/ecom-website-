const express = require('express');
const { createRazorpayOrder, verifyAndPlaceOrder, placeCODOrder } = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// POST /api/payment/create-order  → creates a Razorpay order and returns orderId + key
router.post('/create-order', verifyToken, createRazorpayOrder);

// POST /api/payment/verify  → verifies signature and places order in DB
router.post('/verify', verifyToken, verifyAndPlaceOrder);

// POST /api/payment/cod → places a Cash on Delivery order
router.post('/cod', verifyToken, placeCODOrder);

module.exports = router;
