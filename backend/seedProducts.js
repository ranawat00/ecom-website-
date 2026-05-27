const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/productModel');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const products = [
    {
        id: 'maaposhan-kit',
        title: 'MaaPoshan Recovery Kit',
        subtitle: 'Mother & Baby Luxury Gifting Box',
        tag: 'PREMIUM GIFTING KIT',
        description: 'A premium luxury gifting box thoughtfully designed to nourish and pamper new mothers and their babies during the delicate postpartum recovery period.',
        variants: {
            '1 Box': { price: 3999.00, originalPrice: 4999.00, discount: '20% OFF' }
        },
        reviews: 320,
        images: ['/images/maaposhan-gifting-kit.png'],
        benefits: [
            { id: 1, icon: 'Leaf', text: 'Pure Organic Recovery Paste' },
            { id: 2, icon: 'HeartPulse', text: 'Essential Mom Self-Care' },
            { id: 3, icon: 'Sparkles', text: 'Delicate Baby Essentials' },
            { id: 4, icon: 'Truck', text: 'Luxury Gifting Box' }
        ],
        details: {
            essenceQuote: '"A beautiful, premium luxury gifting kit to celebrate and support a mother\'s postpartum healing and her baby\'s early days."',
            essenceDesc: 'The MaaPoshan Gifting Kit is the ultimate postpartum recovery system, beautifully curated for new mothers and their babies. It features premium essentials including organic Harira strength paste, soft breast pads, self-care items, baby wipes, a premium feeding cover, wooden spoon, and a soothing rest mask, all housed in a luxury gift box.',
            ingredients: [
                { name: 'MaaPoshan Harira Strength Paste', image: '/images/maaposhan-harira.png' },
                { name: 'Instant Harira Kit', image: '/images/maaposhan-harira-kit.png' },
                { name: 'Mom & Baby Luxury Essentials', image: '/images/maaposhan-gifting-kit.png' }
            ],
            nutrition: [
                { label: 'Total Items', value: '10 Solutions' },
                { label: 'Care Quality', value: 'Luxury Grade' },
                { label: 'Purity', value: '100% Chemical-Free' }
            ],
            reviewsData: [
                { name: "Meera K.", quote: "This is the most stunning and complete gift set ever. Every single item is high-quality and incredibly useful for both me and my baby.", stars: 5, initial: "M" },
                { name: "Priya S.", quote: "The packaging is spectacular and the products are so pure. The perfect gift for baby showers or new moms.", stars: 5, initial: "P" }
            ],
            relatedData: [
                { id: "maaposhan-harira", title: "MaaPoshan Harira", desc: "Ayurvedic strength and recovery paste.", price: "₹900.00", image: "/images/maaposhan-harira.png", weight: "500g" }
            ]
        }
    },
    {
        id: 'maaposhan-harira',
        title: 'MaaPoshan Harira (Strength Version (Made from Ghee))',
        subtitle: 'For normal delivery moms',
        tag: 'TRADITIONAL HEALING',
        description: 'A traditional, nutrient-dense blend of Desi Ghee, organic jaggery, fresh ginger, saffron, fenugreek, ajwain, and premium nuts crafted for new mothers\' postpartum recovery.',
        variants: {
            'Size - 500gm': { price: 900.00, originalPrice: 1200.00, discount: '25% OFF' },
            'Size - 1000gm': { price: 1800.00, originalPrice: 2400.00, discount: '25% OFF' }
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
            essenceDesc: 'Prepared using the finest almonds, cashews, pure Desi Ghee, chemical-free jaggery, fresh ginger, and postpartum-restorative spices like fenugreek, ajwain, turmeric, and saffron. Our Harira supports lactation, boosts energy levels, and aids in rapid physical recovery after delivery.',
            ingredients: [
                { name: 'Pure Desi Cow Ghee', image: '/images/maaposhan-ghee.png' },
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
                { id: "maaposhan-kit", title: "Postpartum Gifting Kit", desc: "Luxury kit for mother & baby.", price: "₹3,999.00", image: "/images/maaposhan-gifting-kit.png", weight: "1 Box" },
                { id: "maaposhan-harira-kit", title: "Instant Harira Kit", desc: "Traditional postpartum healing kit.", price: "₹750.00", image: "/images/maaposhan-harira-kit.png", weight: "500g" }
            ]
        }
    },
    {
        id: 'maaposhan-harira-gentle',
        title: 'MaaPoshan Harira - Gentle Version (Made from Mustard Oil)',
        subtitle: 'For C-Section mothers',
        tag: 'FOR C-SECTION MOTHERS',
        description: 'A traditional postpartum blend made from pure cold-pressed mustard oil, organic jaggery, fresh ginger, saffron, fenugreek, ajwain, and premium nuts specifically formulated for C-Section mothers\' healing and recovery.',
        variants: {
            '500g': { price: 900.00, originalPrice: 1200.00, discount: '25% OFF' },
            '1kg': { price: 1800.00, originalPrice: 2400.00, discount: '25% OFF' }
        },
        reviews: 152,
        images: ['/images/maaposhan-harira-gentle.png'],
        benefits: [
            { id: 1, icon: 'Leaf', text: 'Gentle on C-Section Healing' },
            { id: 2, icon: 'HeartPulse', text: 'Anti-inflammatory Mustard Oil' },
            { id: 3, icon: 'Sparkles', text: 'Digestive Comfort Spices' },
            { id: 4, icon: 'Truck', text: 'Lactation & Strength Support' }
        ],
        details: {
            essenceQuote: '"Specially slow-cooked with pure mustard oil, our Gentle Harira provides a comforting and warming recovery system tailored for mothers healing from a C-section."',
            essenceDesc: 'Our Gentle Version is prepared using pure cold-pressed mustard oil, replacing ghee to align with traditional postpartum practices for C-section recovery. Combined with premium almonds, dates, fresh ginger, ajwain, and fenugreek, it promotes optimal internal healing, reduces inflammation, and gently aids digestion and lactation.',
            ingredients: [
                { name: 'Cold-Pressed Mustard Oil', image: '/images/maaposhan-harira-gentle.png' },
                { name: 'Organic Jaggery & Ginger', image: '/images/maaposhan-harira.png' },
                { name: 'Almonds & Spices', image: '/images/maaposhan-bites.png' }
            ],
            nutrition: [
                { label: 'Energy', value: '420 kcal' },
                { label: 'Iron', value: '11.8 mg' },
                { label: 'Calcium', value: '115 mg' }
            ],
            reviewsData: [
                { name: "Ritu M.", quote: "Perfect for my C-section recovery. Traditional postpartum recipes specify mustard oil, and this made me feel so light and strong.", stars: 5, initial: "R" },
                { name: "Neha P.", quote: "Very soothing and easy on the stomach. The taste of spices is perfect.", stars: 5, initial: "N" }
            ],
            relatedData: [
                { id: "maaposhan-kit", title: "Postpartum Gifting Kit", desc: "Luxury kit for mother & baby.", price: "₹3,999.00", image: "/images/maaposhan-gifting-kit.png", weight: "1 Box" },
                { id: "maaposhan-harira-kit", title: "Instant Harira Kit", desc: "Traditional postpartum healing kit.", price: "₹750.00", image: "/images/maaposhan-harira-kit.png", weight: "500g" }
            ]
        }
    },
    {
        id: 'maaposhan-harira-kit',
        title: 'MaaPoshan Instant Harira Kit',
        subtitle: 'Raw Product • Ghee • Jaggery Packets',
        tag: 'READY IN 5 MINUTES',
        description: 'A traditional, nutrient-dense postpartum healing kit featuring pre-measured packets of instant Harira mix (roasted herbs & dry fruits), pure desi ghee, and natural jaggery.',
        variants: {
            '500g': { price: 750.00, originalPrice: 999.00, discount: '25% OFF' }
        },
        reviews: 185,
        images: ['/images/maaposhan-harira-kit.png'],
        benefits: [
            { id: 1, icon: 'Leaf', text: 'Pre-Measured Packet System' },
            { id: 2, icon: 'HeartPulse', text: 'Pure Desi Ghee Included' },
            { id: 3, icon: 'Sparkles', text: 'Natural Jaggery Sachet' },
            { id: 4, icon: 'Truck', text: 'Ready in 5 Minutes' }
        ],
        details: {
            essenceQuote: '"Pre-measured packets of 1. Instant Harira Mix, 2. Ghee Packet, 3. Jaggery Packet for modern, hassle-free postpartum wellness."',
            essenceDesc: 'Crafted for busy new mothers, our Instant Harira Kit contains individual pre-measured sachets: 1. Harira Mix (roasted premium herbs, nuts, and dry fruits), 2. Pure Desi Ghee, and 3. Natural chemical-free Jaggery. Simply follow our 5-minute cook & simmer instructions to prepare a fresh, warm bowl of postpartum healing goodness.',
            ingredients: [
                { name: '1. Instant Harira Mix', image: '/images/maaposhan-harira-kit.png' },
                { name: '2. Pure Desi Ghee', image: '/images/maaposhan-harira-kit.png' },
                { name: '3. Natural Jaggery', image: '/images/maaposhan-harira-kit.png' }
            ],
            nutrition: [
                { label: 'Energy', value: '465 kcal' },
                { label: 'Iron', value: '13.1 mg' },
                { label: 'Calcium', value: '125 mg' }
            ],
            reviewsData: [
                { name: "Kajal P.", quote: "So incredibly convenient. Having everything portioned out makes it so easy to prepare, and it tastes just like home.", stars: 5, initial: "K" }
            ],
            relatedData: [
                { id: "maaposhan-harira", title: "MaaPoshan Harira", desc: "Traditional postpartum strength paste.", price: "₹900.00", image: "/images/maaposhan-harira.png", weight: "500g" },
                { id: "maaposhan-kit", title: "Postpartum Gifting Kit", desc: "Luxury kit for mother & baby.", price: "₹3,999.00", image: "/images/maaposhan-gifting-kit.png", weight: "1 Box" }
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
