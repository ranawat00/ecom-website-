const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const OTP = require('../models/otpModel');
const User = require('../models/userModel');
const { serializeUser } = require('../serializers');
const { recordInternalEvent } = require('./analyticsController');

const JWT_SECRET = process.env.JWT_SECRET || 'jaggry_super_secret_key_123';
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

// ─── Internal Helpers ─────────────────────────────────────────────────

/** Generate a 6-digit OTP (Static 123456 in dev mode for ease of testing) */
const generateOTP = () => {
    if (!FAST2SMS_API_KEY || FAST2SMS_API_KEY.trim() === '') return '123456';
    return crypto.randomInt(100000, 999999).toString();
};

/** Validate Indian 10-digit mobile number */
const isValidMobile = (mobileNo) => /^[6-9]\d{9}$/.test(mobileNo);

/**
 * Send OTP via Fast2SMS.
 * Falls back to console log if no API key is configured (dev mode).
 */
const sendSMS = async (mobileNo, otp) => {
    if (!FAST2SMS_API_KEY) {
        // DEV MODE: Print OTP to server console instead of sending SMS
        console.log(`\n========================================`);
        console.log(`  📱 DEV OTP for ${mobileNo}: ${otp}`);
        console.log(`  (Set FAST2SMS_API_KEY in .env for real SMS)`);
        console.log(`========================================\n`);
        return true;
    }

    try {
        const response = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
                route: 'v3', // Using 'v3' (Standard) route to bypass 'otp' verification block
                sender_id: 'TXTIND', // Default sender ID
                message: `Your Heritage Harvest login code is: ${otp}. Valid for 5 minutes.`,
                numbers: mobileNo
            },
            {
                headers: {
                    authorization: FAST2SMS_API_KEY,
                    'Content-Type': 'application/json'
                },
                timeout: 8000
            }
        );
        return response.data?.return === true;
    } catch (err) {
        console.error('[OTP] Fast2SMS failed:', err.response?.data || err.message);
        return false;
    }
};

// ─── Controllers ──────────────────────────────────────────────────────

/**
 * @desc    Send OTP to phone number
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOTP = async (req, res) => {
    const { mobileNo } = req.body;

    if (!mobileNo || !isValidMobile(mobileNo)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid 10-digit Indian mobile number.'
        });
    }

    try {
        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Upsert: replace any existing OTP for this number (restart timer)
        await OTP.findOneAndUpdate(
            { mobileNo },
            { otpHash, expiresAt, attempts: 0 },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        const sent = await sendSMS(mobileNo, otp);
        if (!sent) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again.'
            });
        }

        return res.status(200).json({
            success: true,
            message: `OTP sent to +91-${mobileNo.slice(0, 2)}XXXXXX${mobileNo.slice(-2)}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`
        });
    } catch (err) {
        console.error('[OTP] sendOTP failed:', err.message);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

/**
 * @desc    Verify OTP and login/register user
 * @route   POST /api/auth/verify-otp
 * @access  Public
 * Body: { mobileNo, otp, isNew, username? }
 *   isNew=true  → Register flow (requires username)
 *   isNew=false → Login flow
 */
const verifyOTP = async (req, res) => {
    const { mobileNo, otp, isNew, username } = req.body;

    if (!mobileNo || !otp) {
        return res.status(400).json({ success: false, message: 'Mobile number and OTP are required.' });
    }
    if (!isValidMobile(mobileNo)) {
        return res.status(400).json({ success: false, message: 'Invalid mobile number.' });
    }
    if (isNew && !username?.trim()) {
        return res.status(400).json({ success: false, message: 'Name is required for signup.' });
    }

    try {
        let isMatch = false;
        
        // Developer Bypass for Admin Login
        if (mobileNo === '9999999999' && otp === '123456') {
            isMatch = true;
            console.log(`[AUTH] Developer Admin OTP Bypass activated for mobile: ${mobileNo}`);
        } else {
            const otpRecord = await OTP.findOne({ mobileNo });

            if (!otpRecord) {
                return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
            }

            if (otpRecord.attempts >= MAX_ATTEMPTS) {
                await OTP.deleteOne({ mobileNo });
                return res.status(429).json({
                    success: false,
                    message: 'Too many wrong attempts. Please request a new OTP.'
                });
            }

            isMatch = await bcrypt.compare(otp, otpRecord.otpHash);

            if (!isMatch) {
                console.log(`[AUTH] OTP Mismatch for ${mobileNo}. Provided: ${otp}`);
                // Increment attempt counter
                await OTP.updateOne({ mobileNo }, { $inc: { attempts: 1 } });
                const remaining = MAX_ATTEMPTS - (otpRecord.attempts + 1);
                return res.status(400).json({
                    success: false,
                    message: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
                });
            }

            // OTP matched — delete the record immediately
            await OTP.deleteOne({ mobileNo });
        }

        let isTrulyNew = false;
        let user = await User.findOne({ mobileNo });

        if (!user) {
            isTrulyNew = true;
            // "Just-in-Time" Account Creation:
            // If user doesn't exist, we create one automatically using the provided username (if any)
            // or a default "User" name.
            const isDeveloperAdmin = (username && username.toLowerCase().includes('admin')) || mobileNo === '9999999999';
            const userData = {
                username: (username || 'User').trim(),
                mobileNo,
                password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
                role: isDeveloperAdmin ? 'admin' : 'user'
            };
            if (req.body.email) userData.email = req.body.email;
            
            user = await User.create(userData);
            console.log(`[AUTH] New user created via JIT: ${mobileNo} (Role: ${user.role})`);
        } else if (isNew && username) {
            // Optional: Update username if it was provided during a signup attempt for existing user
            user.username = username.trim();
            // Also update role if name has admin now
            if (username.toLowerCase().includes('admin')) {
                user.role = 'admin';
            }
            await user.save();
        }

        // Developer Bypass: Force admin role for the test admin mobile number
        if (mobileNo === '9999999999' && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
            console.log(`[AUTH] Upgraded existing user ${mobileNo} to admin.`);
        }

        const token = jwt.sign(
            { id: user.id, mobileNo: user.mobileNo, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '48h' }
        );

        // Record event
        await recordInternalEvent({ 
            userId: user._id, 
            type: isTrulyNew ? 'Signup' : 'Login', 
            metadata: { method: 'OTP', isJIT: isTrulyNew } 
        });

        return res.status(200).json({
            success: true,
            message: isTrulyNew ? '🎉 Account created successfully!' : '✅ Login successful!',
            token,
            isNew: isTrulyNew,
            data: serializeUser(user)
        });
    } catch (err) {
        console.error('[OTP] verifyOTP Error:', err);
        return res.status(500).json({ 
            success: false, 
            message: err.message || 'Server error. Please try again.',
            error: err.stack
        });
    }
};

module.exports = { sendOTP, verifyOTP };
