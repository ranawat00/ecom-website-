const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { recordInternalEvent } = require('./analyticsController');

const JWT_SECRET = process.env.JWT_SECRET || 'jaggry_super_secret_key_123';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 */
const signup = async (req, res) => {
    const { username, mobileNo, email, address, password } = req.body;

    try {
        // Check if user already exists (Email or Mobile)
        const existingUser = await User.findOne({ 
            $or: [{ email }, { mobileNo }] 
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or mobile number already exists.'
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user in MongoDB
        const isDeveloperAdmin = (username && username.toLowerCase().includes('admin')) || (email && email.toLowerCase().includes('admin'));
        const newUser = await User.create({
            username,
            mobileNo,
            email,
            address: address || '',
            password: hashedPassword,
            role: isDeveloperAdmin ? 'admin' : 'user'
        });

        // Analytics
        await recordInternalEvent({ userId: newUser._id, type: 'Signup', metadata: { method: 'Email' } });

        // Return success response
        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            data: newUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

/**
 * @desc    Login a user and generate JWT
 * @route   POST /api/auth/login
 */
const login = async (req, res) => {
    const { email, mobileNo, password } = req.body;

    try {
        // Find the user by exactly matching whatever is provided
        const query = email ? { email } : { mobileNo };
        const user = await User.findOne(query);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. User not found.'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Incorrect password.'
            });
        }

        // Developer Bypass: Force admin role upgrade on login if username, email, or mobile triggers it
        const isDeveloperAdmin = (user.username && user.username.toLowerCase().includes('admin')) || 
                                 (user.email && user.email.toLowerCase().includes('admin')) || 
                                 (user.mobileNo === '9999999999');
        if (isDeveloperAdmin && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
            console.log(`[AUTH] Upgraded existing user ${user.mobileNo} to admin during login.`);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, mobileNo: user.mobileNo, role: user.role },
            JWT_SECRET,
            { expiresIn: '48h' }
        );

        // Analytics
        await recordInternalEvent({ userId: user._id, type: 'Login', metadata: { method: email ? 'Email' : 'Mobile' } });

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const updateProfile = async (req, res) => {
    const { username, mobileNo, email } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            { username, mobileNo, email },
            { new: true, select: '-password' }
        );
        
        if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });
        
        return res.status(200).json({ success: true, user: updatedUser, message: 'Profile updated successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * @desc    Change User Password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide both old and new passwords' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect old password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change Password Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};

/**
 * @desc    Forgot Password - Send reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No user found with this email' });
        }

        // Generate reset token (short lived: 1 hour)
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Create Transporter (Mocking with Ethereal)
        let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });

        // Use the actual frontend URL if possible, otherwise use a placeholder
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const mailOptions = {
            from: '"MaaPoshan Support" <support@maaposhan.com>',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h3>Password Reset Request</h3>
                <p>You requested a password reset for your MaaPoshan account.</p>
                <p>Please click the link below to reset your password. This link is valid for 1 hour.</p>
                <a href="${resetUrl}" style="padding: 10px 20px; background-color: #6B1D2F; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
            `,
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("Password reset email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.status(200).json({
            success: true,
            message: 'Reset link sent to your email!',
            previewUrl: nodemailer.getTestMessageUrl(info)
        });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const logout = async (req, res) => {
    try {
        console.log('[AUTH] Logout endpoint hit. Authorization:', req.headers.authorization ? 'Present' : 'Absent');
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                recordInternalEvent({ userId: decoded.id, type: 'Logout' });
            } catch (jwtErr) {
                // Ignore JWT errors on logout
            }
        }
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    signup,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
};
