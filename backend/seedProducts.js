const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/productModel');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const defaultDetails = {
    essenceQuote: '"A heirloom recipe passed down through generations, our products are made by slowly reducing fresh sugarcane juice in shallow iron vats, retaining all natural minerals and its signature earthy caramel notes."',
    essenceDesc: 'Unlike refined products, ours are unrefined and non-centrifuged. It is prepared using traditional methods without any sulfur or chemical clarificants. Each batch is hand-poured, ensuring a texture that melts beautifully.',
    ingredients: [
        { name: 'Sugarcane Juice', image: '/images/ingredients/sugarcane.png' },
        { name: 'Wild Okra Stems', image: '/images/ingredients/okra.png' }
    ],
    nutrition: [
        { label: 'Energy', value: '383 kcal' },
        { label: 'Iron', value: '11.4 mg' },
        { label: 'Magnesium', value: '80 mg' }
    ],
    reviewsData: [
        { name: "Ananya R.", quote: "The depth of flavor is incomparable.", stars: 5, initial: "A" },
        { name: "Siddharth M.", quote: "Knowing it's 100% chemical-free gives me so much peace of mind.", stars: 5, initial: "S" }
    ],
    relatedData: [
        { id: "desi-ghee", title: "Sona Desi Ghee", desc: "Churned from grass-fed Gir cows.", price: "₹1,250.00", image: "/images/desi-ghee.png", weight: "1kg" },
        { id: "jaggery-powder", title: "Jaggery Powder", desc: "Fine-textured pure jaggery powder.", price: "₹95.00", image: "/images/jaggery-powder.png", weight: "1kg" }
    ]
};

const products = [
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
        benefits: [
            { id: 1, icon: 'Leaf', text: 'Sugar Replacement' },
            { id: 2, icon: 'HeartPulse', text: 'Rich in Selenium' },
            { id: 3, icon: 'Sparkles', text: 'Anti-aging' },
            { id: 4, icon: 'Truck', text: 'Direct Sourcing' },
        ],
        details: {
            ...defaultDetails,
            ingredients: [
                { name: 'Sun-dried Jaggery', image: '/images/ingredients/jaggery-raw.png' }
            ],
            essenceDesc: 'The finest powder for bakers and everyday healthy living.'
        }
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
        benefits: [
            { id: 1, icon: 'Leaf', text: 'Digestive Aid' },
            { id: 2, icon: 'HeartPulse', text: 'Detoxifying' },
            { id: 3, icon: 'Sparkles', text: 'Energy Source' },
            { id: 4, icon: 'Truck', text: 'Immunity Boost' },
        ],
        details: {
            ...defaultDetails,
            ingredients: [
                { name: '100% Sugarcane Juice', image: '/images/ingredients/sugarcane.png' }
            ],
            essenceDesc: 'Convenient cubes that bring heritage health to your daily tea and coffee.'
        }
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
        benefits: [
            { id: 1, icon: 'Leaf', text: 'Protein Rich' },
            { id: 2, icon: 'HeartPulse', text: 'Healthy Fats' },
            { id: 3, icon: 'Sparkles', text: 'Mineral Power' },
            { id: 4, icon: 'Truck', text: 'Antioxidants' },
        ],
        details: {
            ...defaultDetails,
            ingredients: [
                { name: 'Pure Jaggery', image: '/images/ingredients/jaggery-raw.png' },
                { name: 'Premium Cashews', image: '/images/ingredients/cashew.png' },
                { name: 'Green Cardamom', image: '/images/ingredients/cardamom.png' }
            ],
            essenceDesc: 'A perfect snack that combines the natural energy of jaggery with the nutty goodness of premium cashews.'
        }
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
        reviews: 95,
        images: ['/images/featured-1.png'],
        benefits: [
            { id: 1, icon: 'Leaf', text: 'Winter Shield' },
            { id: 2, icon: 'HeartPulse', text: 'Calcium Rich' },
            { id: 3, icon: 'Sparkles', text: 'Fiber Packed' },
            { id: 4, icon: 'Truck', text: 'Heart Friend' },
        ],
        details: {
            ...defaultDetails,
            ingredients: [
                { name: 'Heritage Jaggery', image: '/images/ingredients/jaggery-raw.png' },
                { name: 'Himalayan Sesame', image: '/images/ingredients/sesame.png' }
            ],
            essenceDesc: 'Traditional warmth in every bite, perfect for the winter months.'
        }
    },
    {
        id: 'desi-ghee',
        title: 'Sona Desi Ghee',
        tag: 'PURE A2 GHEE',
        description: 'Traditional bilona churned ghee from happy A2 cows. Rich in aroma and nutrients.',
        variants: {
            '500g': { price: 1250.00, originalPrice: 1500.00, discount: '17% OFF' },
            '1kg':  { price: 2299.00, originalPrice: 2800.00, discount: '18% OFF' },
        },
        reviews: 350,
        images: ['/images/desi-ghee.png'],
        benefits: [
            { id: 1, icon: 'Leaf', text: 'A2 Beta-Casein' },
            { id: 2, icon: 'HeartPulse', text: 'Butyric Acid' },
            { id: 3, icon: 'Sparkles', text: 'Brain Health' },
            { id: 4, icon: 'Truck', text: 'Lactose Free' },
        ],
        details: { 
            ...defaultDetails, 
            ingredients: [
                { name: 'A2 Grass-fed Milk', image: '/images/ingredients/a2-milk.png' },
                { name: 'Traditional Culture', image: '/images/ingredients/culture.png' }
            ],
            essenceQuote: '"Slow-churned to perfection using earthen pots and a wooden bilona."',
            essenceDesc: 'Crafted using the ancient Bilona method, our ghee is more than just fat; it is a source of pure energy.'
        }
    }
];

const { notifySubscribers } = require('./utils/emailService');

const seed = async () => {
    try {
        console.log('Clearing old products...');
        await Product.deleteMany({});
        
        console.log('Inserting real product catalog...');
        await Product.insertMany(products);
        
        // Notify subscribers about the latest products (limit to first few to avoid spam if many)
        for (const p of products.slice(0, 3)) {
            await notifySubscribers(p);
        }
        
        console.log('Seeded all products successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
