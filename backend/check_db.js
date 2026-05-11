const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Assuming this script is run from /var/www/html/jaggry-we-aap/backend
const Product = require('./models/productModel');

dotenv.config();

const checkDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI not found in env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Product.countDocuments();
        console.log(`Product count: ${count}`);
        const products = await Product.find({}, 'id title');
        console.log('Products in DB:', JSON.stringify(products, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkDB();
