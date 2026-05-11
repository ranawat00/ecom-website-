import React from 'react';
import '../../assets/styles/Heritage.css';

const Heritage = () => {
  return (
    <section className="heritage-section">
      <div className="heritage-container">
        <div className="heritage-content">
          <span className="heritage-subtitle">MASTERING THE ART</span>
          <h2 className="heritage-title">Hand-Poured Heritage</h2>
          <div className="heritage-description">
            <p>
              At Amritan, we believe in the sanctity of slow-food. Our Jaggery is crafted using 
              time-honored techniques where fresh sugarcane juice is reduced in shallow iron vats, 
              retaining its signature golden hue and complex mineral profile.
            </p>
            <p>
              Unlike commercial alternatives, our process is entirely sulfur-free. Every block 
              is hand-poured with precision, ensuring a crystalline texture that dissolves 
              beautifully whether it's in your morning chai or a traditional festive sweet.
            </p>
          </div>
          
          <div className="heritage-stats">
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Chemical Free</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">48H</span>
              <span className="stat-label">Slow Process</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">8th</span>
              <span className="stat-label">Gen Mastery</span>
            </div>
          </div>
        </div>
        
        <div className="heritage-image-wrapper">
          <div className="heritage-image-card">
            <img 
              src="/images/desi-gud-main.png" 
              alt="Artisanal Jaggery Craft" 
              className="heritage-img"
            />
            <div className="heritage-image-overlay">
              <span>TRADITIONAL VATS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Heritage);
