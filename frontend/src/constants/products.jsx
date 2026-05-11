import { Star, Leaf, HeartPulse, Sparkles, Truck } from 'lucide-react';
import React from 'react';

// Default detail block for mocking
export const defaultDetails = {
  essenceQuote: '"A heirloom recipe passed down through generations, our Desi Gud is made by slowly reducing fresh sugarcane juice in shallow iron vats, retaining all natural minerals and its signature earthy caramel notes."',
  essenceDesc: 'Unlike refined sugar, our jaggery is unrefined and non-centrifuged. It is prepared using traditional methods without any sulfur or chemical clarificants. Each block is hand-poured, ensuring a texture that melts beautifully into your Masala Chai or morning porridge.',
  ingredients: ['Certified Sugarcane Juice', 'Wild Okra Stems (Natural Clarifier)'],
  nutrition: [
    { label: 'Energy', value: '383 kcal' },
    { label: 'Iron', value: '11.4 mg' },
    { label: 'Magnesium', value: '80 mg' }
  ],
  reviewsData: [
    { name: "Ananya R.", quote: "The depth of flavor is incomparable. It has this rich, smoky caramel undertone that you just don't get with store-bought jaggery.", stars: 5, initial: "A" },
    { name: "Siddharth M.", quote: "Used it for my child's teething biscuits. Knowing it's 100% chemical-free gives me so much peace of mind.", stars: 5, initial: "S" },
    { name: "Priya V.", quote: "The packaging is as beautiful as the product. Feels like receiving a luxury gift from nature itself.", stars: 5, initial: "P" }
  ],
  relatedData: [
    { title: "A2 Bilona Ghee", desc: "Churned from grass-fed Gir cows.", price: "₹1,250.00", image: "/images/a2-ghee-jar.png" },
    { title: "Wild Forest Honey", desc: "Raw, unpasteurized floral nectar.", price: "₹799.00", image: "/images/wild-honey.png" },
    { title: "Masala Chai Blend", desc: "Stone-ground spices and CTC tea.", price: "₹450.00", image: "/images/chai-blend.png" }
  ]
};

export const productDatabase = {
  'desi-gud': {
    id: 'desi-gud',
    title: 'Desi Gud',
    tag: 'ARTISANAL CHOICE',
    description: 'Hand-crafted chemical-free jaggery blocks from the heart of sugarcane belts.',
    variants: {
      '500g': { price: 349.00, originalPrice: 499.00, discount: '30% OFF' },
      '1kg':  { price: 649.00, originalPrice: 899.00, discount: '28% OFF' },
    },
    reviews: 128,
    images: ['/images/desi-gud-main.png', '/images/desi-gud-thumb1.png', '/images/desi-gud-thumb2.png'],
    benefits: [
      { id: 1, icon: <Leaf size={16} />, text: '100% Organic' },
      { id: 2, icon: <HeartPulse size={16} />, text: 'Iron Rich' },
      { id: 3, icon: <Sparkles size={16} />, text: 'No Chemicals' },
      { id: 4, icon: <Truck size={16} />, text: 'Direct Sourcing' },
    ],
    details: defaultDetails
  },
  'desi-ghee': {
    id: 'desi-ghee',
    title: 'Sona Desi Ghee',
    tag: 'PURE A2 GHEE',
    description: 'Traditional bilona churned ghee from happy A2 cows. Rich in aroma and nutrients.',
    variants: {
      '500g': { price: 1250.00, originalPrice: 1500.00, discount: '17% OFF' },
      '1kg':  { price: 2299.00, originalPrice: 2800.00, discount: '18% OFF' },
    },
    reviews: 350,
    images: ['/images/desi-ghee.png', '/images/desi-ghee.png', '/images/desi-ghee.png'],
    benefits: [
      { id: 1, icon: <Leaf size={16} />, text: 'A2 Milk' },
      { id: 2, icon: <HeartPulse size={16} />, text: 'Heart Healthy' },
      { id: 3, icon: <Sparkles size={16} />, text: 'Bilona Method' },
      { id: 4, icon: <Truck size={16} />, text: 'Farm Fresh' },
    ],
    details: {
      ...defaultDetails,
      essenceQuote: '"Slow-churned to perfection using earthen pots and a wooden bilona, capturing the golden essence of pure A2 milk."',
      ingredients: ['100% Pure A2 Cow Milk Fat'],
    }
  },
  'kaju-jaggery': {
    id: 'kaju-jaggery',
    title: 'Kaju Jaggery',
    tag: 'PREMIUM BLEND',
    description: 'Rich, nutty jaggery infused with premium cashews for an elegant sweet treat.',
    variants: {
      '500g': { price: 499.00, originalPrice: 650.00, discount: '23% OFF' },
      '1kg':  { price: 949.00, originalPrice: 1199.00, discount: '21% OFF' },
    },
    reviews: 84,
    images: ['/images/kaju-jaggery.png', '/images/kaju-jaggery.png', '/images/kaju-jaggery.png'],
    benefits: [
      { id: 1, icon: <Leaf size={16} />, text: 'Premium Nuts' },
      { id: 2, icon: <HeartPulse size={16} />, text: 'Energy Boost' },
      { id: 3, icon: <Sparkles size={16} />, text: 'Handcrafted' },
      { id: 4, icon: <Truck size={16} />, text: 'Direct Sourcing' },
    ],
    details: defaultDetails
  },
  'jaggery-powder': {
    id: 'jaggery-powder',
    title: 'Jaggery Powder',
    tag: 'VERSATILE ESSENTIAL',
    description: 'Fine-textured pure jaggery powder, the perfect healthy alternative to refined sugar.',
    variants: {
      '500g': { price: 250.00, originalPrice: 300.00, discount: '17% OFF' },
      '1kg':  { price: 459.00, originalPrice: 550.00, discount: '17% OFF' },
    },
    reviews: 210,
    images: ['/images/jaggery-powder.png', '/images/jaggery-powder.png', '/images/jaggery-powder.png'],
    benefits: [
      { id: 1, icon: <Leaf size={16} />, text: 'Easy to dissolve' },
      { id: 2, icon: <HeartPulse size={16} />, text: 'Nutrient Rich' },
      { id: 3, icon: <Sparkles size={16} />, text: 'No Chemicals' },
      { id: 4, icon: <Truck size={16} />, text: 'Direct Sourcing' },
    ],
    details: defaultDetails
  },
  'dry-fruit-jaggery': {
    id: 'dry-fruit-jaggery',
    title: 'Dry Fruit Jaggery',
    tag: 'CURATED LUXURY',
    description: 'A decadent blend of traditional jaggery generously studded with almonds and pistachios.',
    variants: {
      '500g': { price: 450.00, originalPrice: 550.00, discount: '18% OFF' },
      '1kg':  { price: 849.00, originalPrice: 999.00, discount: '15% OFF' },
    },
    reviews: 95,
    images: ['/images/featured-1.png', '/images/featured-1.png', '/images/featured-1.png'],
    benefits: [
      { id: 1, icon: <Leaf size={16} />, text: '100% Organic' },
      { id: 2, icon: <HeartPulse size={16} />, text: 'Almonds & Pistas' },
      { id: 3, icon: <Sparkles size={16} />, text: 'No Chemicals' },
      { id: 4, icon: <Truck size={16} />, text: 'Direct Sourcing' },
    ],
    details: defaultDetails
  },
  'traditional-desi-ghee': {
    id: 'traditional-desi-ghee',
    title: 'Traditional Desi Ghee',
    tag: 'HERITAGE GHEE',
    description: 'Classic artisanal ghee housed in a beautiful traditional clay pot.',
    variants: {
      '500g': { price: 1250.00, originalPrice: 1500.00, discount: '17% OFF' },
      '1kg':  { price: 2299.00, originalPrice: 2800.00, discount: '18% OFF' },
    },
    reviews: 412,
    images: ['/images/featured-2.png', '/images/featured-2.png', '/images/featured-2.png'],
    benefits: [
      { id: 1, icon: <Leaf size={16} />, text: 'A2 Milk' },
      { id: 2, icon: <HeartPulse size={16} />, text: 'Bilona Churned' },
      { id: 3, icon: <Sparkles size={16} />, text: 'Clay Pot Aged' },
      { id: 4, icon: <Truck size={16} />, text: 'Direct Sourcing' },
    ],
    details: defaultDetails
  },
  'royal-desi-gud': {
    id: 'royal-desi-gud',
    title: 'Royal Desi Gud',
    tag: 'CURATED LUXURY',
    description: 'Perfectly formed rectangular blocks of premium grade heritage jaggery.',
    variants: {
      '500g': { price: 320.00, originalPrice: 400.00, discount: '20% OFF' },
      '1kg':  { price: 599.00, originalPrice: 749.00, discount: '20% OFF' },
    },
    reviews: 156,
    images: ['/images/featured-3.png', '/images/featured-3.png', '/images/featured-3.png'],
    benefits: [
      { id: 1, icon: <Leaf size={16} />, text: '100% Organic' },
      { id: 2, icon: <HeartPulse size={16} />, text: 'Iron Rich' },
      { id: 3, icon: <Sparkles size={16} />, text: 'Handcrafted' },
      { id: 4, icon: <Truck size={16} />, text: 'Direct Sourcing' },
    ],
    details: defaultDetails
  }
};
