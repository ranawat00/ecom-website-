import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import '../assets/styles/Products.css';

const getDynamicProductTitle = (product, selectedKey) => {
  if (product.id === 'maaposhan-harira') {
    return 'MaaPoshan Harira (Strength Version (Made from Ghee))';
  }
  return product.title;
};

const getDynamicSubtitle = (product, selectedKey) => {
  if (product.id === 'maaposhan-harira') {
    return 'For normal delivery moms';
  }
  return '';
};

const heroSlides = [
    { image: '/images/desi-gud-main.png', tag: 'HERITAGE JAGGARY' },
    { image: '/images/kaju-jaggery.png', tag: 'PREMIUM BLEND' },
    { image: '/images/jaggery-powder.png', tag: 'NATURAL SWEETENER' }
];

const Products = () => {
    const { addToCart } = useCart();
    const { products: allProducts, loading } = useProducts();
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [selectedVariants, setSelectedVariants] = React.useState({});

    React.useEffect(() => {
        if (allProducts.length > 0) {
            const variantsMap = {};
            allProducts.forEach(p => {
                const keys = Object.keys(p.variants || {});
                variantsMap[p.id] = p.variants?.['500g'] ? '500g' : (p.variants?.['1kg'] ? '1kg' : keys[0]);
            });
            setSelectedVariants(prev => ({ ...variantsMap, ...prev }));
        }
        
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [allProducts, heroSlides.length]);

    const handleVariantChange = (e, productId, weight) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedVariants(prev => ({ ...prev, [productId]: weight }));
    };

    const handleBuyNow = (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        const selectedWeight = selectedVariants[product.id];
        const variant = product.variants[selectedWeight];
        
        const directBuyItem = {
            productId: product.id,
            title: product.title,
            price: variant.price,
            image: product.images[0],
            weight: selectedWeight,
            quantity: 1
        };
        navigate('/checkout', { state: { directBuyItem } });
    };

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        const selectedWeight = selectedVariants[product.id];
        const variant = product.variants[selectedWeight];

        addToCart({
            productId: product.id,
            title: product.title,
            price: variant.price,
            image: product.images[0],
            weight: selectedWeight,
            quantity: 1
        });
    };

    if (loading) return <div className="products-loading">Loading heritage collection...</div>;
    if (allProducts.length === 0) return <div className="products-empty">No artisanal products found. Check back soon.</div>;

    return (
        <div className="all-products-page">
            <header className="products-hero">
                {heroSlides.map((slide, index) => (
                    <div 
                        key={index}
                        className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    />
                ))}
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <span className="hero-tag">{heroSlides[currentSlide].tag}</span>
                    <h1>Heritage Harvest Atelier</h1>
                    <p>Pure, chemical-free, and ethically sourced. Explore our full range of traditional essentials.</p>
                    <div className="carousel-dots">
                        {heroSlides.map((_, index) => (
                            <span 
                                key={index} 
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            ></span>
                        ))}
                    </div>
                </div>
            </header>

            <div className="products-container">
                <div className="products-controls">
                    <div className="result-count">{allProducts.length} artisanal products</div>
                </div>

                <div className="products-grid">
                    {allProducts.map((product) => {
                        const selectedWeight = selectedVariants[product.id];
                        const variant = product.variants[selectedWeight];
                        const variantKeys = Object.keys(product.variants || {});

                        return (
                        <Link to={`/product/${product.id}`} key={product.id} className="product-card" style={{ textDecoration: 'none' }}>
                            <div className="card-image-wrap">
                                <img src={product.images[0]} alt={product.title} />
                                <div className="card-tag">{product.tag}</div>
                            </div>
                            <div className="card-body">
                                <div className="card-header">
                                    <h3>{getDynamicProductTitle(product, selectedWeight)}</h3>
                                    <span className="price-tag">₹{variant?.price || 0}</span>
                                </div>
                                {product.id === 'maaposhan-harira' && (
                                    <p className="card-subtitle-custom" style={{ fontSize: '0.75rem', color: '#8C6374', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '-8px' }}>
                                        {getDynamicSubtitle(product, selectedWeight)}
                                    </p>
                                )}
                                <p className="card-desc">{product.description}</p>
                                
                                {variantKeys.length > 1 && (
                                    <div className="card-select-wrapper" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                        <select 
                                            value={selectedWeight}
                                            onChange={(e) => handleVariantChange(e, product.id, e.target.value)}
                                            className="products-variant-select"
                                        >
                                            {variantKeys.map(weight => (
                                                <option key={weight} value={weight}>{weight}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="card-footer">
                                    <button
                                        className="btn-add-cart"
                                        onClick={(e) => handleAddToCart(e, product)}
                                    >
                                        ADD TO CART
                                    </button>
                                    <button
                                        className="btn-buy-now"
                                        onClick={(e) => handleBuyNow(e, product)}
                                    >
                                        BUY NOW
                                    </button>
                                </div>
                            </div>
                        </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Products;
