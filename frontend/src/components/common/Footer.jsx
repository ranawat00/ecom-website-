import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import '../../assets/styles/Footer.css';

const InstagramIcon = React.memo(({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
));

const FacebookIcon = React.memo(({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
));

const TwitterIcon = React.memo(({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
));

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">

        {/* Top Grid Area */}
        <div className="footer-grid">

          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-logo-container" style={{ marginBottom: '16px' }}>
              <img src="/images/logo.png" alt="MaaPoshan Logo" />
            </div>
            <p className="footer-description">
              Recover, nourish, and heal with traditional postpartum wellness essentials crafted with love, purity, and organic care.
            </p>
            <div className="footer-socials">
              <a href="#instagram" aria-label="Instagram"><InstagramIcon size={20} /></a>
              <a href="#facebook" aria-label="Facebook"><FacebookIcon size={20} /></a>
              <a href="#twitter" aria-label="Twitter"><TwitterIcon size={20} /></a>
              <a href="#email" aria-label="Email"><Mail size={20} /></a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="footer-links-col">
            <h3 className="footer-heading">Shop</h3>
            <ul className="footer-links">
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/product/maaposhan-harira">MaaPoshan Harira</Link></li>
              <li><Link to="/product/maaposhan-kit">MaaPoshan Recovery Kit</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h3 className="footer-heading">Company</h3>
            <ul className="footer-links">
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h3 className="footer-heading">Support</h3>
            <ul className="footer-links">
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/return-policy">Return Policy</Link></li>
              <li><Link to="/refund-policy">Refund Policy</Link></li>
              <li><Link to="/orders">Track Order</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar Area */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} MaaPoshan. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default React.memo(Footer);
