const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/productModel');

dotenv.config();

const revertBrandInDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for brand reverting...');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to process.`);

        for (const product of products) {
            let updated = false;

            // 1. Title
            if (product.title && /amritan/i.test(product.title)) {
                product.title = product.title
                    .replace(/Amritan/g, 'Jaggery')
                    .replace(/amritan/g, 'jaggery');
                updated = true;
            }

            // 2. Description
            if (product.description && /amritan/i.test(product.description)) {
                product.description = product.description
                    .replace(/Amritan/g, 'Jaggery')
                    .replace(/amritan/g, 'jaggery');
                updated = true;
            }

            // 3. Images (FIX THE FOLDER PATHS)
            if (product.images) {
                product.images = product.images.map(img => {
                    if (img.includes('amritan')) {
                        updated = true;
                        return img.replace(/amritan/g, 'jaggery');
                    }
                    return img;
                });
            }

            // 4. Nested details
            if (product.details) {
                if (product.details.essenceDesc && /amritan/i.test(product.details.essenceDesc)) {
                    product.details.essenceDesc = product.details.essenceDesc
                        .replace(/Amritan/g, 'Jaggery')
                        .replace(/amritan/g, 'jaggery');
                    updated = true;
                }
            }

            if (updated) {
                product.markModified('images');
                product.markModified('details');
                await product.save();
                console.log(`Reverted product: ${product.id}`);
            }
        }

        console.log('Brand reverting in database complete!');
        process.exit(0);
    } catch (err) {
        console.error('Database revert failed:', err);
        process.exit(1);
    }
};

revertBrandInDB();
