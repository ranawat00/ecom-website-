const express = require('express');
const { signup, login, logout, getProfile, updateProfile, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { sendOTP, verifyOTP } = require('../controllers/otpController');
const { validateSignup, validateLogin } = require('../middlewares/validationMiddleware');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// ─── OTP Auth (Phone-based login/signup) ──────────────────────────────
// POST /api/auth/send-otp    → sends 6-digit OTP to mobile number
router.post('/send-otp', sendOTP);
// POST /api/auth/logout → cleans up session
router.post('/logout', logout);
// POST /api/auth/verify-otp  → verifies OTP, returns JWT token
router.post('/verify-otp', verifyOTP);


// Any request to /signup will first go through the validateSignup middleware,
// and if valid, will be handled by the signup controller.
router.post('/signup', validateSignup, signup);

// Login route
router.post('/login', validateLogin, login);

// Forgot Password (Public)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected User Dashboard Routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);
// logout moved to top

module.exports = router;
