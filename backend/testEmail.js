const { sendEmail } = require('./utils/emailService');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const test = async () => {
    console.log('Testing email send to gauravreshu1727@gmail.com...');
    try {
        const success = await sendEmail({
            to: 'support@amritan.com',
            subject: '🔍 Test from Amritan ',
            html: '<h1>System Test</h1><p>If you see this, your email configuration is correct.</p>'
        });
        console.log('Result:', success ? 'Success' : 'Failed');
    } catch (err) {
        console.error('Error in test:', err);
    }
    process.exit(0);
};

test();
