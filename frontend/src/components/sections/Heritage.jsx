import React from 'react';
import '../../assets/styles/Heritage.css';

const Heritage = () => {
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
              <span className="stat-label">A2 Ghee Base</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Ayurvedic</span>
              <span className="stat-label">Expert Formulated</span>
            </div>
          </div>
        </div>
        
        <div className="heritage-image-wrapper">
          <div className="heritage-image-card">
            <img 
              src="/images/maaposhan-harira.png" 
              alt="MaaPoshan Harira Craft" 
              className="heritage-img"
            />
            <div className="heritage-image-overlay">
              <span>SLOW COOKED HEALING</span>
            </div>
          </div>
        </div>
      </div>
    </section>

  );
};

export default React.memo(Heritage);
