const mongoose = require('mongoose');

/**
 * OTP Model
 * - Stores hashed OTPs (never plain-text)
 * - TTL index on `expiresAt` → MongoDB auto-deletes old records
 * - `attempts` → prevents brute-force (max 3 wrong guesses)
 */
const otpSchema = new mongoose.Schema({
    mobileNo: {
        type: String,
        required: true
    },
    otpHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // MongoDB TTL — auto-deletes on expiry
    },
    attempts: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Ensure only one active OTP per phone number at a time
otpSchema.index({ mobileNo: 1 }, { unique: true });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
