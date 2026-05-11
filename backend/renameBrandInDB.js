const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/productModel');

dotenv.config();

const renameBrandInDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for brand renaming...');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to process.`);

        for (const product of products) {
            let updated = false;

            // 1. Title
            if (product.title && /jaggery|jaggry/i.test(product.title)) {
                product.title = product.title
                    .replace(/Jaggery/g, 'Amritan')
                    .replace(/jaggery/g, 'amritan')
                    .replace(/Jaggry/g, 'Amritan')
                    .replace(/jaggry/g, 'amritan')
                    .replace(/JAGGERY/g, 'AMRITAN');
                updated = true;
            }

            // 2. Description
            if (product.description && /jaggery|jaggry/i.test(product.description)) {
                product.description = product.description
                    .replace(/Jaggery/g, 'Amritan')
                    .replace(/jaggery/g, 'amritan')
                    .replace(/Jaggry/g, 'Amritan')
                    .replace(/jaggry/g, 'amritan')
                    .replace(/JAGGERY/g, 'AMRITAN');
                updated = true;
            }

            // 3. Nested details
            if (product.details) {
                if (product.details.essenceQuote && /jaggery|jaggry/i.test(product.details.essenceQuote)) {
                    product.details.essenceQuote = product.details.essenceQuote
                        .replace(/Jaggery/g, 'Amritan')
                        .replace(/jaggery/g, 'amritan')
                        .replace(/Jaggry/g, 'Amritan')
                        .replace(/jaggry/g, 'amritan');
                    updated = true;
                }
                if (product.details.essenceDesc && /jaggery|jaggry/i.test(product.details.essenceDesc)) {
                    product.details.essenceDesc = product.details.essenceDesc
                        .replace(/Jaggery/g, 'Amritan')
                        .replace(/jaggery/g, 'amritan')
                        .replace(/Jaggry/g, 'Amritan')
                        .replace(/jaggry/g, 'amritan');
                    updated = true;
                }
            }

            if (updated) {
                // Must use markModified for nested map/object changes if necessary
                product.markModified('details');
                await product.save();
                console.log(`Updated product: ${product.id}`);
            }
        }

        console.log('Brand renaming in database complete!');
        process.exit(0);
    } catch (err) {
        console.error('Database rename failed:', err);
        process.exit(1);
    }
};

renameBrandInDB();
