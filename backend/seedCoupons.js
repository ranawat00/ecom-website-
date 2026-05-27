const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Coupon = require('./models/couponModel');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const today = new Date();
const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

const coupons = [
    {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minPurchase: 0,
        maxDiscount: 300,
        applicableProducts: [],
        startDate: today,
        endDate: nextYear,
        usageLimit: 1000,
        isActive: true
    },
    {
        code: 'SAVE500',
        discountType: 'fixed',
        discountValue: 500,
        minPurchase: 2000,
        maxDiscount: null,
        applicableProducts: [],
        startDate: today,
        endDate: nextYear,
        usageLimit: 500,
        isActive: true
    },
    {
        code: 'KITSAVE500',
        discountType: 'fixed',
        discountValue: 500,
        minPurchase: 3000,
        maxDiscount: null,
        applicableProducts: ['maaposhan-kit'], // Restrict to the gifting kit
        startDate: today,
        endDate: nextYear,
        usageLimit: 200,
        isActive: true
    }
];

const mongoose = require('mongoose');

const seedCoupons = async () => {
    try {
        await connectDB();
        console.log('Dropping collection to reset indexes...');
        await mongoose.connection.db.collection('coupons').drop().catch(() => {});

        console.log('Inserting default premium coupons...');
        await Coupon.insertMany(coupons);

        console.log('Seeded all coupons successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Coupon seeding failed:', err.message);
        process.exit(1);
    }
};

seedCoupons();
