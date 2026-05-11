const nodemailer = require('nodemailer');
const Inquiry = require('../models/inquiryModel');

// Handle contact form submission
exports.submitEnquiry = async (req, res) => {
    const { name, email, phone, subject, message, type } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Please provide name, email and message.' });
    }

    try {
        // Save to Database
        await Inquiry.create({ name, email, phone, subject, message, type: type || 'General' });

        // 1. Create a test account (Ethereal Mail)
        // In a real production app, you would use real credentials from .env
        let testAccount = await nodemailer.createTestAccount();

        // 2. Create Transporter
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        // 3. Define Email Options
        const mailOptions = {
            from: `"${name}" <${email}>`, // sender address
            to: "admin@amritan.com", // list of receivers
            subject: `Contact Enquiry: ${subject || 'General Inquiry'}`, // Subject line
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`, // plain text body
            html: `
                <h3>New Contact Us Enquiry</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
                <br/>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `, // html body
        };

        // 4. Send Email
        let info = await transporter.sendMail(mailOptions);

        console.log("Message sent: %s", info.messageId);
        // Preview URL only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.status(200).json({
            success: true,
            message: 'Your enquiry has been sent successfully!',
            previewUrl: nodemailer.getTestMessageUrl(info) // Attached for verification during dev
        });
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send email. Please try again later.' });
    }
};
