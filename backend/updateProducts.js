const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/productModel');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const defaultDetails = {
    essenceQuote: '"A heirloom recipe passed down through generations, our handcrafted sweets are made by slowly reducing fresh sugarcane juice in shallow iron vats, retaining all natural minerals."',
    essenceDesc: 'Prepared using traditional methods without any sulfur or chemical clarificants. Each block is hand-poured, ensuring a texture that melts beautifully.',
    ingredients: [
        { name: 'Sugarcane Juice', image: '/images/ingredients/sugarcane.png' },
        { name: 'Wild Okra Stems', image: '/images/ingredients/okra.png' }
    ],
    nutrition: [
        { label: 'Energy', value: '383 kcal' },
        { label: 'Iron', value: '11.4 mg' },
        { label: 'Magnesium', value: '80 mg' }
    ]
};

const newProductsData = [
    {
        id: 'jaggery-powder',
        title: 'Jaggery Powder',
        tag: 'VERSATILE ESSENTIAL',
        description: 'Fine-textured pure jaggery powder, the perfect healthy alternative to refined sugar.',
        variants: {
            '1kg':   { price: 95.00, originalPrice: 120.00, discount: '21% OFF' },
            '2.5kg': { price: 220.00, originalPrice: 280.00, discount: '21% OFF' }
        },
        reviews: 210,
        images: ['/images/jaggery-powder.png'],
        benefits: [{ id: 1, icon: 'Sparkles', text: 'No Chemicals' }],
        details: defaultDetails
    },
    {
        id: 'jaggery-cube',
        title: 'Jaggery Cube',
        tag: 'ARTISANAL CHOICE',
        description: 'Traditional handcrafted chemical-free jaggery cubes. Pure and nutrient-rich.',
        variants: {
            '500g': { price: 46.00, originalPrice: 60.00, discount: '23% OFF' },
            '900g': { price: 75.00, originalPrice: 100.00, discount: '25% OFF' },
            '4kg':  { price: 260.00, originalPrice: 350.00, discount: '26% OFF' }
        },
        reviews: 145,
        images: ['/images/desi-gud-main.png'],
        benefits: [{ id: 1, icon: 'Leaf', text: '100% Organic' }],
        details: defaultDetails
    },
    {
        id: 'kaju-jaggery-cube',
        title: 'Kaju Jaggery Cube',
        tag: 'PREMIUM BLEND',
        description: 'Rich, nutty jaggery infused with premium cashews for an elegant sweet treat.',
        variants: {
            '500g': { price: 68.00, originalPrice: 90.00, discount: '24% OFF' },
            '900g': { price: 120.00, originalPrice: 160.00, discount: '25% OFF' }
        },
        reviews: 84,
        images: ['/images/kaju-jaggery.png'],
        benefits: [{ id: 1, icon: 'HeartPulse', text: 'Energy Boost' }],
        details: defaultDetails
    },
    {
        id: 'til-jaggery-cube',
        title: 'Till Jaggery Cube',
        tag: 'SEASONAL SPECIAL',
        description: 'A crunchy blend of traditional jaggery and roasted sesame seeds.',
        variants: {
            '500g': { price: 60.00, originalPrice: 80.00, discount: '25% OFF' },
            '900g': { price: 96.00, originalPrice: 130.00, discount: '26% OFF' }
        },
        reviews: 62,
        images: ['/images/featured-1.png'],
        benefits: [{ id: 1, icon: 'Leaf', text: 'Fresh Sesame' }],
        details: defaultDetails
    },
    {
        id: 'desi-ghee',
        title: 'Desi Ghee',
        tag: 'PURE A2 GHEE',
        description: 'Traditional bilona churned ghee from happy A2 cows. Rich in aroma and nutrients.',
        variants: {
            '500g': { price: 1250.00, originalPrice: 1500.00, discount: '17% OFF' },
            '1kg':  { price: 2299.00, originalPrice: 2800.00, discount: '18% OFF' },
        },
        reviews: 350,
        images: ['/images/desi-ghee.png'],
        benefits: [{ id: 1, icon: 'HeartPulse', text: 'Heart Healthy' }],
        details: { ...defaultDetails, essenceQuote: '"Slow-churned to perfection using earthen pots."' }
    }
];

const { notifySubscribers } = require('./utils/emailService');

const updateCatalog = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        console.log('Clearing old products...');
        await Product.deleteMany({});

        console.log('Inserting new product catalog...');
        await Product.insertMany(newProductsData);

        // Notify subscribers about new products
        for (const p of newProductsData.slice(0, 3)) {
            await notifySubscribers(p);
        }

        console.log('SUCCESS: Product catalog has been updated with 5 new products!');
        process.exit(0);
    } catch (err) {
        console.error('ERROR during update:', err);
        process.exit(1);
    }
};

updateCatalog();

