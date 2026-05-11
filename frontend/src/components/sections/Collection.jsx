import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import '../../assets/styles/Collection.css';

const Collection = () => {
  const { addToCart } = useCart();
  const { productMap, loading } = useProducts();
  const navigate = useNavigate();
  const [selectedVariants, setSelectedVariants] = React.useState({});

  // Initialize selected variants when products load
  React.useEffect(() => {
    if (Object.keys(productMap).length > 0) {
      const defaultVariants = {};
      Object.keys(productMap).forEach(id => {
        const p = productMap[id];
        const variantKeys = Object.keys(p.variants || {});
        defaultVariants[p.id] = p.variants?.['500g'] ? '500g' : (p.variants?.['1kg'] ? '1kg' : variantKeys[0]);
      });
      setSelectedVariants(prev => ({ ...defaultVariants, ...prev }));
    }
  }, [productMap]);

  const handleQuickAdd = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    const product = productMap[productId];
    const variantKey = selectedVariants[productId];
    if (!product || !variantKey) return;
    
    const variant = product.variants[variantKey];
    await addToCart({
      productId: product.id,
      title: product.title,
      price: variant.price,
      image: product.images[0],
      weight: variantKey,
      quantity: 1
    });
  };

  const handleBuyNow = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    const product = productMap[productId];
    const variantKey = selectedVariants[productId];
    if (!product || !variantKey) return;

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
  if (Object.keys(productMap).length === 0) return null;

  const renderProductCard = (productId, extraClass = '') => {
    const p = productMap[productId];
    if (!p) return null;
    const selectedKey = selectedVariants[productId];
    const variant = p.variants[selectedKey];
    const variantKeys = Object.keys(p.variants || {});

    return (
      <Link to={`/product/${p.id}`} className={`collection-card ${extraClass}`} style={{ textDecoration: 'none' }}>
        <img src={p.images[0]} alt={p.title} className="collection-img" loading="lazy" />
        <div className="collection-text-overlay">
          <div className="overlay-info">
            <h3>{p.title}</h3>
            <p>₹{variant?.price || 0} • {selectedKey}</p>
            
            {/* Variant Selector */}
            {variantKeys.length > 1 && (
              <div className="home-variant-selector">
                {variantKeys.map(key => (
                  <button 
                    key={key}
                    className={`variant-pill ${selectedKey === key ? 'active' : ''}`}
                    onClick={(e) => handleVariantChange(e, p.id, key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="overlay-actions">
            <button className="coll-btn-cart" onClick={(e) => handleQuickAdd(e, p.id)}>+ Cart</button>
            <button className="coll-btn-buy" onClick={(e) => handleBuyNow(e, p.id)}>Buy Now</button>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section className="collection-section">
      <div className="collection-header">
        <h2 className="collection-title">The Atelier Collection</h2>
        <div className="collection-divider"></div>
      </div>
      
      <div className="collection-grid">
        {renderProductCard('desi-ghee', 'card-large')}
        {renderProductCard('kaju-jaggery-cube', 'kaju')}
        {renderProductCard('jaggery-cube', 'gud')}
        {renderProductCard('jaggery-powder', 'powder')}
        {renderProductCard('til-jaggery-cube', 'til')}
      </div>
    </section>
  );
};

export default React.memo(Collection);
