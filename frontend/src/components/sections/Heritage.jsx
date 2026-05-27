import React, { useState, useEffect } from 'react';
import '../../assets/styles/Heritage.css';

const slides = [
  {
    image: '/images/maaposhan-gifting-kit.png',
    label: 'PREMIUM LUXURY KIT'
  },
  {
    image: '/images/maaposhan-harira.png',
    label: 'STRENGTH PASTE - GHEE'
  },
  {
    image: '/images/maaposhan-harira-gentle.png',
    label: 'GENTLE - MUSTARD OIL'
  },
  {
    image: '/images/maaposhan-harira-kit.png',
    label: 'INSTANT 5-MIN HEALING'
  }
];

const Heritage = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="heritage-section">
      <div className="heritage-container">
        <div className="heritage-content">
          <span className="heritage-subtitle">TRADITIONAL POSTPARTUM WELLNESS</span>
          <h2 className="heritage-title">Traditional Postpartum Healing</h2>
          <div className="heritage-description">
            <p>
              At MaaPoshan, we believe in restoring the strength of new mothers using traditional Ayurvedic wisdom. Our Harira and wellness blends are slow-cooked in small batches, ensuring every nutrient and essential oil is preserved just as nature intended.
            </p>
            <p>
              Using pure A2 cow ghee, organic jaggery, and selected postpartum-restorative spices (like fenugreek, ajwain, turmeric, and ginger), our products help new mothers rebuild tissue, improve lactation, and boost overall energy levels during the delicate fourth trimester.
            </p>
          </div>
          
          <div className="heritage-stats">
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Natural Ingredients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Bilona</span>
              <span className="stat-label">MaaPoshan Harira</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Ayurvedic</span>
              <span className="stat-label">Expert Formulated</span>
            </div>
          </div>
        </div>
        
        <div className="heritage-image-wrapper">
          <div className="heritage-image-card">
            {slides.map((slide, idx) => (
              <img 
                key={idx}
                src={slide.image} 
                alt={slide.label} 
                className={`heritage-img ${idx === activeIndex ? 'active' : ''}`}
                loading="lazy"
              />
            ))}
            <div className="heritage-image-overlay">
              <span>{slides[activeIndex].label}</span>
            </div>
            
            {/* Slider Dots Indicator */}
            <div className="slider-dots">
              {slides.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`slider-dot ${idx === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

  );
};

export default React.memo(Heritage);
