import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  // We will mock a slider with 3 slides, using the same image or fallback colored backgrounds
  // since we only successfully generated one image.
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    '/images/hero-1.png',
    '/images/hero-1.png', // Fallback to same image for demo
    '/images/hero-1.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="hero-container">
      {/* Background Slider */}
      <div className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={index === currentSlide ? { backgroundImage: `url(${slide})` } : {}}
          />
        ))}
        {/* Gradient overlay to ensure text readability */}
        <div className="hero-overlay"></div>
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="hero-content-inner">
          <span className="hero-tag">TRADITIONAL SOURCING</span>
          <h1 className="hero-title">
            Pure.<br />
            Natural.<br />
            Chemical-<br />
            Free.
          </h1>
          <p className="hero-description">
            Experience the golden essence of earth. Our handcrafted jaggery and desi ghee are nurtured in the heart of heritage farms, preserving every nutrient just as nature intended.
          </p>
          <div className="hero-buttons">
            <button className="btn-shop" onClick={() => navigate('/products')}>Shop Now</button>
            <button className="btn-explore" onClick={() => navigate('/about')}>Explore Heritage</button>
          </div>
        </div>
      </div>

      {/* Slider Indicators */}
      <div className="hero-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Hero);
