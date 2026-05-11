import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Leaf, HeartPulse, Sparkles, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/api';
import '../assets/styles/Product.css';

const ICON_MAP = {
  Leaf: <Leaf size={16} />,
  HeartPulse: <HeartPulse size={16} />,
  Sparkles: <Sparkles size={16} />,
  Truck: <Truck size={16} />
};

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState('');
  const [activeImage, setActiveImage] = useState(null);
  const [activeTab, setActiveTab] = useState('essence');
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', text: '', stars: 5 });

  // Parse price strings like "₹1,250.00" → 1250
  const parsePrice = (priceStr) => parseFloat(String(priceStr).replace(/[^0-9.]/g, '')) || 0;
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.get(`/api/products/${id}`);
        if (data.success) {
          const p = data.product;
          setProduct(p);
          if (p.images && p.images.length > 0) {
            setActiveImage(p.images[0]);
          }
          const variantKeys = Object.keys(p.variants || {});
          if (variantKeys.length > 0) {
            setSelectedWeight(p.variants['500g'] ? '500g' : (p.variants['1kg'] ? '1kg' : variantKeys[0]));
          }
          setReviews(p.details?.reviewsData || []);
        }
      } catch (err) {
        console.error('Failed to fetch product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="product-loading">Loading artisan details...</div>;
  if (!product) return <div className="product-error">Product not found.</div>;

  // Derive the active price variant based on selected weight
  const activeVariant = product.variants?.[selectedWeight] || {
    price: product.price || 0,
    originalPrice: product.originalPrice || 0,
    discount: product.discount || ''
  };

  return (
    <React.Fragment>
    <div className="product-page-container">
      <div className="product-grid">
        
        {/* Left Column: Image Gallery */}
        <div className="product-gallery">
          <div className="main-image-container">
            <div className="product-tag">{product.tag}</div>
            {product.images && product.images.length > 0 && (
              <img src={activeImage || product.images[0]} alt={product.title} className="main-image" />
            )}
          </div>
          <div className="thumbnail-row">
            {product.images && product.images.length > 1 && product.images.slice(1).map((img, idx) => (
              <div 
                key={idx} 
                className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt={`${product.title} angle ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Product Details */}
        <div className="product-details">
          
          <div className="reviews-row">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#8B5E3C" color="#8B5E3C" className="star-icon" />
              ))}
            </div>
            <span className="review-count">({product.reviews} Reviews)</span>
          </div>

          <h1 className="product-title">{product.title}</h1>
          <p className="product-description">{product.description}</p>

          <div className="pricing-row">
            <span className="current-price">₹{activeVariant.price.toFixed(2)}</span>
            <span className="original-price">₹{activeVariant.originalPrice.toFixed(2)}</span>
            <span className="discount-tag">{activeVariant.discount}</span>
          </div>

          <div className="weight-selector">
            <p className="selector-label">SELECT WEIGHT</p>
            <div className="weight-options">
              {Object.entries(product.variants || {}).map(([weight, v]) => (
                <button 
                  key={weight}
                  className={`weight-btn ${selectedWeight === weight ? 'active' : ''}`}
                  onClick={() => setSelectedWeight(weight)}
                >
                  <span className="btn-weight">{weight}</span>
                  <span className="btn-price">₹{v.price}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="btn-add-to-cart"
              onClick={() => addToCart({
                productId: id,
                title: product.title,
                price: activeVariant.price,
                image: product.images[0],
                weight: selectedWeight,
                quantity: 1
              })}
            >ADD TO CART</button>
            <button
              className="btn-buy-now"
              onClick={async () => {
                await addToCart({
                  productId: id,
                  title: product.title,
                  price: activeVariant.price,
                  image: product.images[0],
                  weight: selectedWeight,
                  quantity: 1
                }, false, true);
                navigate('/checkout');
              }}
            >BUY NOW</button>
          </div>

          <div className="benefits-grid">
            {product?.benefits?.map((benefit) => (
              <div key={benefit.id} className="benefit-item">
                <span className="benefit-icon">{ICON_MAP[benefit.icon] || <Leaf size={16} />}</span>
                <span className="benefit-text">{benefit.text}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Product Extended Info Section (Tabs) */}
      <div className="product-extended-info">
        <div className="info-tabs">
          <button 
            className={`tab-btn ${activeTab === 'essence' ? 'active' : ''}`}
            onClick={() => setActiveTab('essence')}
          >
            The Essence
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            Ingredients
          </button>
          <button 
            className={`tab-btn ${activeTab === 'benefits' ? 'active' : ''}`}
            onClick={() => setActiveTab('benefits')}
          >
            Health Benefits
          </button>
        </div>
        
        <div className="tab-divider"></div>

        {activeTab === 'essence' && product.details && (
          <div className="tab-content essence-content fade-in">
            <p className="essence-quote">{product.details.essenceQuote}</p>
            <p className="essence-desc">{product.details.essenceDesc}</p>
            
            <div className="essence-split">
              <div className="split-column">
                <h3 className="split-heading">Pure Ingredients</h3>
                <div className="ingredient-circles">
                  {product.details.ingredients?.map((item, i) => (
                    <div key={i} className="ingredient-circle-item">
                      <div className="circle-image-wrapper">
                        <img src={typeof item === 'object' ? item.image : '/images/ingredients/fallback.png'} alt={typeof item === 'object' ? item.name : item} className="ingredient-round-img" onError={(e) => e.target.src = '/images/ingredients/fallback.png'} />
                      </div>
                      <span>{typeof item === 'object' ? item.name : item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="split-column">
                <h3 className="split-heading">Nutrition Facts</h3>
                <div className="nutrition-table">
                  {product.details.nutrition?.map((item, i) => (
                    <div className="nutrition-row" key={i}>
                      <span className="nutrition-label">{item.label}</span>
                      <span className="nutrition-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ingredients' && product.details && (
          <div className="tab-content fade-in">
            <h3 className="tab-section-title">What's Inside</h3>
            <p className="essence-desc">Our commitment to purity means zero hidden additives. Each batch is made with just the essentials nature intended.</p>
            <div className="ingredient-circles-detailed">
              {product.details.ingredients?.map((item, i) => (
                <div key={i} className="ingredient-circle-item">
                  <div className="circle-image-wrapper large">
                    <img src={typeof item === 'object' ? item.image : '/images/ingredients/fallback.png'} alt={typeof item === 'object' ? item.name : item} className="ingredient-round-img" onError={(e) => e.target.src = '/images/ingredients/fallback.png'} />
                  </div>
                  <span className="ingredient-name">{typeof item === 'object' ? item.name : item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="tab-content fade-in">
            <h3 className="tab-section-title">Wholesome Living</h3>
            <p className="essence-desc">Rich in traditional wisdom and natural nutrients, Amritan products are crafted to nourish both body and soul.</p>
            <div className="benefits-detailed-grid">
              {product?.benefits?.map((benefit) => (
                <div key={benefit.id} className="detailed-benefit-card">
                  <div className="benefit-icon-large">
                    {ICON_MAP[benefit.icon] || <Leaf size={24} />}
                  </div>
                  <div className="benefit-info">
                    <h4>{benefit.text}</h4>
                    <p>Traditional superfood properties that support a balanced lifestyle.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Voices of Purity Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <div className="reviews-title-block">
            <h2>Voices of Purity</h2>
            <p>What our atelier community has to say.</p>
          </div>
          <button className="btn-write-review" onClick={() => setShowReviewForm(true)}>WRITE A REVIEW</button>
        </div>

        <div className="reviews-grid">
          {reviews.map((review, idx) => (
            <div className="review-card" key={idx}>
              <div className="review-stars">
                {[...Array(review.stars)].map((_, i) => (
                  <Star key={i} size={14} fill="#6a462b" color="#6a462b" />
                ))}
              </div>
              <p className="review-quote">"{review.quote}"</p>
              <div className="review-author">
                <div className="author-avatar">{review.initial}</div>
                <div className="author-info">
                  <span className="author-name">{review.name}</span>
                  <span className="author-verified">Verified Collector</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Pairs Beautifully Width Section (Full width colored wrapper) */}
    <div className="related-section-wrapper">
      <div className="related-container">
        <h2 className="related-title">Pairs beautifully with...</h2>
        
        <div className="related-grid">
          {product?.details?.relatedData?.map((item, idx) => {
            const relatedId = item.id || item.title?.toLowerCase().replace(/\s+/g, '-');
            return (
            <Link to={`/product/${relatedId}`} className="related-card" key={idx} style={{ textDecoration: 'none' }}>
              <img src={item.image} alt={item.title} className="related-image" />
              <div className="related-info">
                <div>
                  <h3 className="related-itemName">{item.title}</h3>
                  <p className="related-desc">{item.desc}</p>
                </div>
                <div className="related-price-row">
                  <span className="related-price">{item.price}</span>
                  <div className="related-actions-mini">
                    <button
                      className="btn-plus"
                      aria-label={`Quick Add ${item.title}`}
                      title={`Add ${item.title} to cart`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart({
                          productId: item.id || item.title.toLowerCase().replace(/\s+/g, '-'),
                          title: item.title,
                          price: parsePrice(item.price),
                          image: item.image,
                          weight: item.weight || '1kg',
                          quantity: 1
                        });
                      }}
                    >+</button>
                    <button
                       className="btn-buy-mini"
                       onClick={async (e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         await addToCart({
                           productId: item.id || item.title.toLowerCase().replace(/\s+/g, '-'),
                           title: item.title,
                           price: parsePrice(item.price),
                           image: item.image,
                           weight: item.weight || '1kg',
                           quantity: 1
                         }, false, true);
                         navigate('/checkout');
                       }}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            </Link>
             );
           })}
        </div>
      </div>
    </div>

    {/* Form Modal Overlay */}
    {showReviewForm && (
      <div className="review-modal-overlay">
        <div className="review-modal-content fade-in">
           <div className="modal-header">
             <h3>Write a Review</h3>
             <button className="close-modal" onClick={() => setShowReviewForm(false)}>✕</button>
           </div>
           
           <form onSubmit={(e) => {
              e.preventDefault();
              if(!newReview.name || !newReview.text) return;
              const reviewObj = {
                name: newReview.name,
                quote: newReview.text,
                stars: newReview.stars,
                initial: newReview.name.charAt(0).toUpperCase()
              };
              setReviews([reviewObj, ...reviews]);
              setShowReviewForm(false);
              setNewReview({ name: '', text: '', stars: 5 });
           }} className="review-form">
              <label>Your Name</label>
              <input type="text" placeholder="Enter your name" value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} required />
              
              <label>Rating</label>
              <div className="star-rating-select">
                 {[1,2,3,4,5].map(num => (
                    <Star 
                      key={num} 
                      size={28} 
                      fill={num <= newReview.stars ? '#8B5E3C' : 'transparent'} 
                      color="#8B5E3C" 
                      onClick={() => setNewReview({...newReview, stars: num})}
                      className="clickable-star"
                    />
                 ))}
              </div>
              
              <label>Your Review</label>
              <textarea placeholder="Share your experience with this product..." rows="5" value={newReview.text} onChange={(e) => setNewReview({...newReview, text: e.target.value})} required></textarea>
              
              <button type="submit" className="btn-submit-review">Submit Review</button>
           </form>
        </div>
      </div>
    )}

    </React.Fragment>
  );
};

export default React.memo(Product);
