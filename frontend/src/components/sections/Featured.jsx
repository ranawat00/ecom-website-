import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import '../../assets/styles/Featured.css';

const getDynamicProductTitle = (product, selectedKey) => {
  if (product.id === 'maaposhan-harira') {
    return 'MaaPoshan Harira (Strength Version (Made from Ghee))';
  }
  return product.title;
};

const getDynamicSubtitle = (product, selectedKey) => {
  if (product.id === 'maaposhan-kit') {
    return 'Mother & Baby Luxury Gifting Box';
  }
  if (product.id === 'maaposhan-harira') {
    return 'For normal delivery moms';
  }
  if (product.id === 'maaposhan-harira-gentle') {
    return 'For C-Section mothers';
  }
  if (product.id === 'maaposhan-harira-kit') {
    return 'Raw Product • Ghee • Jaggery Packets';
  }
  return `${selectedKey || ''} Premium Pack`;
};

const Featured = () => {
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  const navigate = useNavigate();
  const [selectedVariants, setSelectedVariants] = React.useState({});
  const [isHovered, setIsHovered] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (isHovered || loading || !products || products.length === 0) return;
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          scrollRef.current.scrollTo({
            left: scrollLeft + 350,
            behavior: 'smooth'
          });
        }
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered, loading, products]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8
        : scrollLeft + clientWidth * 0.8;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  // Filter and initialize
  const featuredProducts = React.useMemo(() => {
    return products.filter(p => 
      p.tag === 'PREMIUM GIFTING KIT' || p.tag === 'TRADITIONAL HEALING' || p.tag === 'READY IN 5 MINUTES' || p.tag === 'FOR C-SECTION MOTHERS'
    );
  }, [products]);

  React.useEffect(() => {
    if (featuredProducts.length > 0) {
      const defaultVariants = {};
      featuredProducts.forEach(p => {
        const variantKeys = Object.keys(p.variants || {});
        defaultVariants[p.id] = p.variants?.['500g'] ? '500g' : (p.variants?.['1kg'] ? '1kg' : variantKeys[0]);
      });
      setSelectedVariants(prev => ({ ...defaultVariants, ...prev }));
    }
  }, [featuredProducts]);

  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const variantKey = selectedVariants[product.id];
    const variant = product.variants[variantKey];
    
    addToCart({
      productId: product.id,
      title: product.title,
      price: variant.price,
      image: product.images[0],
      weight: variantKey,
      quantity: 1
    });
  };

  const handleBuyNow = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const variantKey = selectedVariants[product.id];
    const variant = product.variants[variantKey];
    
    await addToCart({
      productId: product.id,
      title: product.title,
      price: variant.price,
      image: product.images[0],
      weight: variantKey,
      quantity: 1
    }, false);
    navigate('/checkout');
  };

  const handleVariantChange = (e, productId, variantKey) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVariants(prev => ({ ...prev, [productId]: variantKey }));
  };

  if (loading) return null;
  if (featuredProducts.length === 0) return null;

  return (
    <section 
      className="featured-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="featured-header">
        <div className="featured-title-wrapper">
           <span className="featured-tag">CURATION</span>
           <h2 className="featured-title">Featured Essentials</h2>
        </div>
        <div className="featured-arrows">
          <button className="arrow-btn" aria-label="Previous" onClick={() => scroll('left')}><ArrowLeft size={20} /></button>
          <button className="arrow-btn" aria-label="Next" onClick={() => scroll('right')}><ArrowRight size={20} /></button>
        </div>
      </div>

      <div className="featured-grid" ref={scrollRef}>
        {featuredProducts.map((product) => {
          const selectedKey = selectedVariants[product.id];
          const variant = product.variants[selectedKey];
          const variantKeys = Object.keys(product.variants || {});
          
          return (
            <Link to={`/product/${product.id}`} key={product.id} className="featured-card" style={{ textDecoration: 'none' }}>
              <div className="card-image-wrapper">
                <img src={product.images[0]} alt={product.title} className="card-image" loading="lazy" />
              </div>
              <div className="card-body">
                <div className="card-info">
                   <div className="card-text">
                     <h3 className="card-name">{getDynamicProductTitle(product, selectedKey)}</h3>
                     <p className="card-subtitle">{getDynamicSubtitle(product, selectedKey)}</p>

                     
                     {/* Variant Selector */}
                     {variantKeys.length > 1 && (
                       <div className="card-select-wrapper" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                         <select 
                           value={selectedKey}
                           onChange={(e) => handleVariantChange(e, product.id, e.target.value)}
                           className="featured-variant-select"
                         >
                           {variantKeys.map(key => (
                             <option key={key} value={key}>{key}</option>
                           ))}
                         </select>
                       </div>
                     )}
                   </div>
                   <span className="card-price">₹{variant?.price || 0}</span>
                </div>
                <div className="card-actions">
                  <button 
                    className="btn-add-cart"
                    onClick={(e) => handleQuickAdd(e, product)}
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
    </section>
  );
};

export default React.memo(Featured);
