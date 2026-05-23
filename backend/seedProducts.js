const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/productModel');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });


const products = [
    {
        id: 'maaposhan-kit',
        title: 'MaaPoshan Postpartum Recovery Kit',
        tag: 'COMPLETE POSTPARTUM CARE',
        description: 'A complete recovery and nourishment kit for new mothers. Includes 8 thoughtful solutions for postpartum strength, energy, and wellness.',
        variants: {
            '1 Box': { price: 4000.00, originalPrice: 5500.00, discount: '27% OFF' }
        },
        reviews: 145,
        images: ['/images/maaposhan-kit.png'],
        benefits: [
            { id: 1, icon: 'Leaf', text: '100% Organic & Clean' },
            { id: 2, icon: 'HeartPulse', text: 'Postpartum Recovery' },
            { id: 3, icon: 'Sparkles', text: '8 Solutions in 1' },
            { id: 4, icon: 'Truck', text: 'Doctor Approved' }
        ],
        details: {
            essenceQuote: '"A thoughtful postpartum recovery system designed by experts to ease a new mother\'s transition into motherhood."',
            essenceDesc: 'The MaaPoshan Postpartum Recovery Kit contains everything a new mother needs to recover, heal, and nourish herself. From traditional organic Harira paste to self-care pouches, organic breast pads, calming tea, and feeding covers, each of the 8 products addresses a specific postpartum challenge. Crafted with love, care, and absolute purity.',
            ingredients: [
                { name: 'MaaPoshan Harira Strength Paste', image: '/images/maaposhan-harira.png' },
                { name: 'Calming Herbal Tea', image: '/images/maaposhan-tea.png' },
                { name: 'Dry Fruit Energy Bites', image: '/images/maaposhan-bites.png' }
            ],
            nutrition: [
                { label: 'Total Items', value: '8 Solutions' },
                { label: 'Care Quality', value: 'Premium Grade' },
                { label: 'Purity', value: '100% Chemical-Free' }
            ],
            reviewsData: [
                { name: "Meera K.", quote: "This kit is the most thoughtful gift any new mom could receive. Every single item inside solved a real postpartum problem.", stars: 5, initial: "M" },
                { name: "Priya S.", quote: "I loved the Harira and the calming tea. Knowing it's 100% chemical-free gives me so much peace of mind.", stars: 5, initial: "P" }
            ],
            relatedData: [
                { id: "maaposhan-harira", title: "MaaPoshan Harira", desc: "Ayurvedic strength and recovery paste.", price: "₹900.00", image: "/images/maaposhan-harira.png", weight: "500g" },
                { id: "maaposhan-ghee", title: "Pure A2 Ghee", desc: "Bilona churned grass-fed cow ghee.", price: "₹1,299.00", image: "/images/maaposhan-ghee.png", weight: "500ml" }
            ]
        }
    },
    {
        id: 'maaposhan-harira',
        title: 'MaaPoshan Harira',
        tag: 'TRADITIONAL HEALING',
        description: 'A traditional, nutrient-dense blend of A2 ghee, organic jaggery, fresh ginger, saffron, fenugreek, ajwain, and premium nuts crafted for new mothers\' postpartum recovery.',


        variants: {
            'Size - 500gm': { price: 900.00, originalPrice: 1200.00, discount: '25% OFF' },
            'Size - 1000gm': { price: 1800.00, originalPrice: 2400.00, discount: '25% OFF' },

        },
        reviews: 210,
        images: ['/images/maaposhan-harira.png'],
        benefits: [
            { id: 1, icon: 'Leaf', text: 'Restores Energy & Strength' },
            { id: 2, icon: 'HeartPulse', text: 'Supports Healthy Lactation' },
            { id: 3, icon: 'Sparkles', text: 'Gentle on Digestion' },
            { id: 4, icon: 'Truck', text: 'Rich in Iron & Calcium' }
        ],
        details: {
            essenceQuote: '"Rooted in ancient Indian postpartum wisdom, our Harira is a delicious, slow-cooked blend that helps new mothers regain their strength."',
            essenceDesc: 'Prepared using the finest almonds, cashews, pure A2 ghee, chemical-free jaggery, fresh ginger, and postpartum-restorative spices like fenugreek, ajwain, turmeric, and saffron. Our Harira supports lactation, boosts energy levels, and aids in rapid physical recovery after delivery.',
            ingredients: [
                { name: 'Pure A2 Cow Ghee', image: '/images/maaposhan-ghee.png' },
                { name: 'Organic Jaggery & Ginger', image: '/images/maaposhan-harira.png' },
                { name: 'Almonds & Saffron', image: '/images/maaposhan-bites.png' }
            ],
            nutrition: [
                { label: 'Energy', value: '450 kcal' },
                { label: 'Iron', value: '12.5 mg' },
                { label: 'Calcium', value: '120 mg' }
            ],
            reviewsData: [
                { name: "Ananya R.", quote: "The depth of flavor is incomparable. It gave me the strength and energy I needed in those sleepless early weeks.", stars: 5, initial: "A" },
                { name: "Siddharth M.", quote: "My wife loved it. Knowing it's 100% chemical-free gives me so much peace of mind.", stars: 5, initial: "S" }
            ],
            relatedData: [
                { id: "maaposhan-kit", title: "MaaPoshan Recovery Kit", desc: "Complete postpartum wellness kit.", price: "₹4,000.00", image: "/images/maaposhan-kit.png", weight: "1 Box" },
                { id: "maaposhan-tea", title: "Calming Herbal Tea", desc: "Caffeine-free relaxation blend.", price: "₹399.00", image: "/images/maaposhan-tea.png", weight: "20 Bags" }
            ]
        }
    },
    {
        id: 'maaposhan-tea',
        title: 'MaaPoshan Calming Herbal Tea',
        tag: 'RELAXATION & SLEEP',
        description: 'A soothing herbal blend of chamomile, lavender, and traditional herbs to calm the mind, relieve stress, and support deep, restful sleep for new mothers.',
        variants: {
            '20 Tea Bags': { price: 399.00, originalPrice: 499.00, discount: '20% OFF' }
        },
        reviews: 95,
        images: ['/images/maaposhan-tea.png'],
        benefits: [
            { id: 1, icon: 'Leaf', text: 'Stress Relief & Calming' },
            { id: 2, icon: 'HeartPulse', text: 'Deep Sleep Support' },
            { id: 3, icon: 'Sparkles', text: '100% Caffeine-Free' },
            { id: 4, icon: 'Truck', text: 'All Natural Botanicals' }
        ],
        details: {
            essenceQuote: '"A calming botanical escape for sleepless nights and busy days of early motherhood."',
            essenceDesc: 'MaaPoshan Calming Herbal Tea combines dried organic chamomile flowers, lavender buds, and traditional adaptogenic herbs. It is naturally caffeine-free and formulated to soothe the nervous system, reduce postpartum anxiety, and gently invite restful sleep so you can wake up refreshed.',
            ingredients: [
                { name: 'Organic Chamomile', image: '/images/maaposhan-tea.png' },
                { name: 'Lavender Buds', image: '/images/maaposhan-tea.png' }
            ],
            nutrition: [
                { label: 'Servings', value: '20 Cups' },
                { label: 'Caffeine', value: '0 mg' },
                { label: 'Sugar', value: '0 g' }
            ],
            reviewsData: [
                { name: "Divya N.", quote: "This tea has become my evening ritual. It helps me unwind and get deep, restful sleep after long days.", stars: 5, initial: "D" },
                { name: "Kajal P.", quote: "Smells wonderful and taste so soothing. Best tea for new mothers.", stars: 5, initial: "K" }
            ],
            relatedData: [
                { id: "maaposhan-harira", title: "MaaPoshan Harira", desc: "Traditional postpartum strength paste.", price: "₹900.00", image: "/images/maaposhan-harira.png", weight: "500g" },
                { id: "maaposhan-bites", title: "Dry Fruit Bites", desc: "Instant energy snack for new moms.", price: "₹599.00", image: "/images/maaposhan-bites.png", weight: "300g" }
            ]
        }
    },
    {
        id: 'maaposhan-bites',
        title: 'MaaPoshan Premium Dry Fruit Bites',
        tag: 'HEALTHY SNACK',
        description: 'Nutrient-dense bites packed with premium almonds, cashews, dates, and seeds to provide instant energy and healthy fats for active mothers.',
        variants: {
            '300g': { price: 599.00, originalPrice: 799.00, discount: '25% OFF' }
        },
        reviews: 84,
        images: ['/images/maaposhan-bites.png'],
        benefits: [
            { id: 1, icon: 'Leaf', text: 'Instant Energy Boost' },
            { id: 2, icon: 'HeartPulse', text: 'No Added Sugar' },
            { id: 3, icon: 'Sparkles', text: 'Protein & Fiber Rich' },
            { id: 4, icon: 'Truck', text: 'Healthy Monounsaturated Fats' }
        ],
        details: {
            essenceQuote: '"Delicious, chewable bites that deliver clean, long-lasting energy whenever you need a quick pick-me-up."',
            essenceDesc: 'Crafted for busy new mothers who need quick, healthy nutrition on the go. Our Premium Dry Fruit Bites are made by blending mineral-rich dates, almonds, cashews, pistachios, and chia seeds. With absolutely zero added sugar or artificial preservatives, they are rich in dietary fiber, protein, and healthy monounsaturated fats.',
            ingredients: [
                { name: 'Organic Dates', image: '/images/maaposhan-bites.png' },
                { name: 'Premium Nuts & Seeds', image: '/images/maaposhan-bites.png' }
            ],
            nutrition: [
                { label: 'Energy', value: '110 kcal / bite' },
                { label: 'Protein', value: '3.5 g' },
                { label: 'Fiber', value: '2.1 g' }
            ],
            reviewsData: [
                { name: "Rohini T.", quote: "Super convenient and healthy! These dry fruit bites satisfy my sweet tooth without any guilt.", stars: 5, initial: "R" }
            ],
            relatedData: [
                { id: "maaposhan-harira", title: "MaaPoshan Harira", desc: "Postpartum strength and recovery paste.", price: "₹900.00", image: "/images/maaposhan-harira.png", weight: "500g" },
                { id: "maaposhan-ghee", title: "Pure A2 Ghee", desc: "Bilona churned A2 cow ghee.", price: "₹1,299.00", image: "/images/maaposhan-ghee.png", weight: "500ml" }
            ]
        }
    },
    {
        id: 'maaposhan-ghee',
        title: 'MaaPoshan Pure A2 Ghee (Bilona Churned)',
        tag: 'POSTPARTUM ESSENTIAL',
        description: 'Pure A2 cow ghee prepared using the traditional Bilona method, essential for postpartum strength, joint health, and overall rejuvenation.',
        variants: {
            '500ml': { price: 1299.00, originalPrice: 1599.00, discount: '18% OFF' },
            '1L': { price: 2399.00, originalPrice: 2999.00, discount: '20% OFF' }
        },
        reviews: 350,
        images: ['/images/maaposhan-ghee.png'],
        benefits: [
            { id: 1, icon: 'Leaf', text: 'Pure A2 Cow Curd Culture' },
            { id: 2, icon: 'HeartPulse', text: 'Traditional Bilona Churned' },
            { id: 3, icon: 'Sparkles', text: 'Joint Strength & Tissue Healing' },
            { id: 4, icon: 'Truck', text: 'Lactose & Gluten Free' }
        ],
        details: {
            essenceQuote: '"Golden elixir churned slowly from curd cultures of grass-fed A2 cow milk."',
            essenceDesc: 'Our A2 ghee is handcrafted using the ancient Bilona method (churning curd made from A2 milk in earthen pots with a wooden churner). Perfect for new mothers, it aids in lubricating joints, rebuilding tissue, improving digestion, and enhancing nutrient absorption from traditional meals.',
            ingredients: [
                { name: 'Grass-Fed A2 Milk', image: '/images/maaposhan-ghee.png' },
                { name: 'Curd Culture', image: '/images/maaposhan-ghee.png' }
            ],
            nutrition: [
                { label: 'Energy', value: '898 kcal' },
                { label: 'Butyric Acid', value: '3.8 g' },
                { label: 'Saturated Fat', value: '65 g' }
            ],
            reviewsData: [
                { name: "Anil S.", quote: "The aroma of this ghee is out of this world. Reminds me of pure, village-made ghee.", stars: 5, initial: "A" }
            ],
            relatedData: [
                { id: "maaposhan-harira", title: "MaaPoshan Harira", desc: "Ayurvedic strength and recovery paste.", price: "₹900.00", image: "/images/maaposhan-harira.png", weight: "500g" },
                { id: "maaposhan-kit", title: "MaaPoshan Recovery Kit", desc: "Complete postpartum wellness kit.", price: "₹4,000.00", image: "/images/maaposhan-kit.png", weight: "1 Box" }
            ]
        }
    }
];

const { notifySubscribers } = require('./utils/emailService');

const seed = async () => {
    try {
        console.log('Using MONGO_URI:', process.env.MONGO_URI);
        await connectDB();
        console.log('Clearing old products...');
        await Product.deleteMany({});

        console.log('Inserting real product catalog...');
        await Product.insertMany(products);

        // Notify subscribers
        for (const p of products.slice(0, 3)) {
            try {
                await notifySubscribers(p);
            } catch (emailErr) {
                console.warn(`Could not send subscription email for ${p.id}:`, emailErr.message);
            }
        }

        console.log('Seeded all products successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
