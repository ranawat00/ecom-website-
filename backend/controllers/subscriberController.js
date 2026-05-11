const Subscriber = require('../models/subscriberModel');
const { sendEmail } = require('../utils/emailService');

exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const existing = await Subscriber.findOne({ email });
        if (existing) {
            if (existing.active) {
                return res.status(400).json({ success: false, message: 'You are already subscribed!' });
            } else {
                existing.active = true;
                await existing.save();
                return res.status(200).json({ success: true, message: 'Welcome back to our heritage circle!' });
            }
        }

        await Subscriber.create({ email });

        // Send a welcome email
        await sendEmail({
            to: email,
            subject: 'Welcome to the Heritage Circle!',
            html: `
                <div style="font-family: serif; color: #3f2a1b; padding: 20px;">
                    <h1 style="color: #8B5E3C;">Welcome to Heritage Harvest</h1>
                    <p>Thank you for joining our heritage circle. You will now receive early access to our artisanal harvests and recipes.</p>
                    <p>Stay tuned for our next seasonal update!</p>
                    <hr style="border: 0.5px solid #D4A373;" />
                    <p style="font-size: 0.8rem; color: #a88871;">Heritage Harvest Atelier</p>
                </div>
            `
        });

        res.status(200).json({ success: true, message: 'Success! Welcome to the Heritage Circle.' });
    } catch (error) {
        console.error('[Subscriber] Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to subscribe. Please try again.' });
    }
};

exports.getAllSubscribers = async (req, res) => {
    try {
        const subs = await Subscriber.find({ active: true });
        res.status(200).json({ success: true, count: subs.length, subscribers: subs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
