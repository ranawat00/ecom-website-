const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Models
const User = require('./models/userModel');
const Product = require('./models/productModel');
const Address = require('./models/addressModel');
const Cart = require('./models/cartModel');
const Order = require('./models/orderModel');

dotenv.config();

const DATA_DIR = path.join(__dirname, 'data');

const readJSON = (filename) => {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for migration...');

        // 1. Migrate Products (Simple, fixed IDs)
        console.log('Migrating Products...');
        const productsJSON = readJSON('products');
        const productItems = Object.values(productsJSON);
        if (productItems.length > 0) {
            await Product.deleteMany({}); // Clear existing
            await Product.insertMany(productItems);
            console.log(`Migrated ${productItems.length} products.`);
        }

        // 2. Migrate Users (Need to track new IDs)
        console.log('Migrating Users...');
        const usersJSON = readJSON('users');
        const userItems = Object.values(usersJSON);
        const userMap = {}; // oldId -> newId

        for (const u of userItems) {
            const oldId = u.id;
            const userData = { ...u };
            delete userData.id;
            
            // Avoid duplicate email errors if running multiple times
            let existing = await User.findOne({ email: u.email });
            if (!existing) {
                existing = await User.create(userData);
            }
            userMap[oldId] = existing._id;
        }
        console.log(`Migrated ${userItems.length} users.`);

        // 3. Migrate Addresses
        console.log('Migrating Addresses...');
        const addrJSON = readJSON('addresses');
        const addrItems = Object.values(addrJSON);
        for (const a of addrItems) {
            const newUserId = userMap[a.userId];
            if (newUserId) {
                const addrData = { ...a, userId: newUserId };
                delete addrData.id;
                await Address.create(addrData);
            }
        }
        console.log(`Migrated ${addrItems.length} addresses.`);

        // 4. Migrate Carts
        console.log('Migrating Carts...');
        const cartsJSON = readJSON('carts');
        for (const [oldUserId, items] of Object.entries(cartsJSON)) {
            const newUserId = userMap[oldUserId];
            if (newUserId) {
                await Cart.findOneAndUpdate(
                    { userId: newUserId },
                    { items: items.map(i => {
                        const item = { ...i };
                        delete item.itemId; 
                        return item;
                    })},
                    { upsert: true }
                );
            }
        }
        console.log('Migrated carts.');

        // 5. Migrate Orders
        console.log('Migrating Orders...');
        const ordersJSON = readJSON('orders');
        const orderItems = Object.values(ordersJSON);
        for (const o of orderItems) {
            const newUserId = userMap[o.userId];
            if (newUserId) {
                const orderData = { ...o, userId: newUserId, orderId: o.id };
                delete orderData.id;
                await Order.create(orderData);
            }
        }
        console.log(`Migrated ${orderItems.length} orders.`);

        console.log('Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
