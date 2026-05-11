const nodemailer = require('nodemailer');
const Subscriber = require('../models/subscriberModel');

let transporter = null;

const getTransporter = async () => {
    if (transporter) return transporter;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('--- Using Ethereal Test Account ---');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user, 
                pass: testAccount.pass,
            },
        });
    } else {
        console.log(`--- Using Gmail Transport (${process.env.SMTP_USER}) ---`);
        transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE || 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    return transporter;
};

const sendEmail = async (options) => {
    try {
        const mailTransporter = await getTransporter();
        const mailOptions = {
            from: `"Heritage Harvest" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        const info = await mailTransporter.sendMail(mailOptions);
        
        if (!process.env.SMTP_USER) {
            console.log(`\n📧 [TEST EMAIL SENT] URL: ${nodemailer.getTestMessageUrl(info)}`);
        } else {
            console.log(`[Email] Success to: ${options.to} (ID: ${info.messageId})`);
        }
        
        return true;
    } catch (err) {
        console.error(`[EmailService] Error for ${options.to}:`, err.message);
        return false;
    }
};

const notifySubscribers = async (product) => {
    try {
        const subscribers = await Subscriber.find({ active: true });
        if (!subscribers.length) return;

        const emailPromises = subscribers.map(sub => sendEmail({
            to: sub.email,
            subject: `✨ New Harvest: ${product.title} is now available!`,
            html: `
                <div style="font-family: serif; color: #3f2a1b; max-width: 600px; margin: 0 auto; border: 1px solid #D4A373; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #8B5E3C; padding: 20px; text-align: center;">
                         <h1 style="color: #FFF8E7; margin: 0;">New Artisanal Harvest</h1>
                    </div>
                    <div style="padding: 30px; background-color: #FFF8E7;">
                        <h2 style="color: #8B5E3C;">${product.title}</h2>
                        <p style="font-size: 1.1rem; line-height: 1.6;">${product.description}</p>
                        <div style="margin: 25px 0;">
                            <img src="${process.env.FRONTEND_URL || 'http://localhost:3000'}${product.images[0]}" alt="${product.title}" style="width: 100%; border-radius: 8px;" />
                        </div>
                        <p>Our latest chemical-free creation is now live in the atelier. Handcrafted with the same heirloom techniques you love.</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/product/${product.id}" style="background-color: #8B5E3C; color: #FFF8E7; padding: 12px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">SHOP NOW</a>
                        </div>
                    </div>
                </div>
            `
        }));

        await Promise.all(emailPromises);
        console.log(`[Email] Notified ${subscribers.length} subscribers about: ${product.title}`);
    } catch (err) {
        console.error('[Email] Failed to notify subscribers:', err.message);
    }
};

const sendOrderEmail = async (user, order, type = 'confirmation') => {
    if (!user.email) return;

    const isCancellation = type === 'cancellation';
    const subject = isCancellation 
        ? `Order Cancelled: #${order.orderId}` 
        : `Order Confirmed: #${order.orderId} ✨`;

    const title = isCancellation ? 'Order Successfully Cancelled' : 'Order Successfully Placed';
    const subtitle = isCancellation 
        ? 'Your order has been cancelled and any refund (if applicable) will be processed shortly.'
        : 'Thank you for your purchase! We are preparing your artisanal heritage products.';

    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0;">${item.title}</td>
            <td style="padding: 10px 0; text-align: right;">${item.quantity} x ₹${item.price}</td>
        </tr>
    `).join('');

    const html = `
        <div style="font-family: 'Georgia', serif; color: #3f2a1b; max-width: 600px; margin: 0 auto; border: 1px solid #D4A373; border-radius: 12px; overflow: hidden;">
            <div style="background-color: ${isCancellation ? '#e74c3c' : '#8B5E3C'}; padding: 30px; text-align: center;">
                 <h1 style="color: #FFF8E7; margin: 0; font-size: 24px;">${title}</h1>
            </div>
            <div style="padding: 30px; background-color: #FFF8E7;">
                <p style="font-size: 1.1rem; margin-bottom: 20px;">Dear ${user.username},</p>
                <p style="line-height: 1.6; margin-bottom: 30px;">${subtitle}</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0d5c1;">
                    <h3 style="margin-top: 0; color: #8B5E3C; border-bottom: 2px solid #F8EED8; padding-bottom: 10px;">Order Details</h3>
                    <p><strong>Order ID:</strong> #${order.orderId}</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        ${itemsHtml}
                        <tr>
                            <td style="padding: 20px 0 0; font-weight: bold; font-size: 1.2rem;">Total Amount</td>
                            <td style="padding: 20px 0 0; text-align: right; font-weight: bold; font-size: 1.2rem; color: #8B5E3C;">₹${order.amount}</td>
                        </tr>
                    </table>
                    <p style="font-size: 0.9rem; color: #7a614e;"><strong>Delivery Address:</strong><br/> ${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" style="background-color: #8B5E3C; color: #FFF8E7; padding: 14px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">VIEW ORDER STATUS</a>
                </div>
                
                <p style="margin-top: 40px; font-size: 0.85rem; color: #a88871; text-align: center;">
                    If you have any questions, reply to this email or contact us at support@amritan.com
                </p>
            </div>
            <div style="background-color: #F8EED8; padding: 15px; text-align: center; font-size: 0.8rem; color: #8B5E3C;">
                © 2024 Heritage Harvest Atelier. Pure. Traditional. Ethical.
            </div>
        </div>
    `;

    return await sendEmail({ to: user.email, subject, html });
};

module.exports = { sendEmail, notifySubscribers, sendOrderEmail };
