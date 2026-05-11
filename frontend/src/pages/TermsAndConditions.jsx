import React from 'react';
import { FileText } from 'lucide-react';
import '../assets/styles/Policies.css';

const TermsAndConditions = () => {
  return (
    <div className="policy-page-container">
      <header className="policy-header">
        <FileText size={48} color="#D4A373" style={{ marginBottom: '16px' }} />
        <h1>Terms & Conditions</h1>
        <p>The agreement between you and Amritan for a seamless experience.</p>
      </header>

      <div className="policy-content">
        <section className="policy-section">
          <h2>Acceptance of Terms</h2>
          <p>By accessing or using the Amritan website, you agree to be bound by these terms. If you do not agree, please refrain from using our platform.</p>
        </section>

        <section className="policy-section">
          <h2>Product Authenticity</h2>
          <p>We take pride in the purity of our Ghee and Jaggery. However, since these are natural products, minor variations in color, texture, and aroma may occur across batches. This is a sign of authenticity, not a defect.</p>
        </section>

        <section className="policy-section">
          <h2>Orders and Pricing</h2>
          <p>We reserve the right to cancel orders in case of incorrect pricing or unavailability. Prices are subject to change without prior notice, but will not affect confirmed orders.</p>
        </section>

        <section className="policy-section">
          <h2>Usage Restrictions</h2>
          <p>Our website content, including images and branding, is the property of Amritan. Unauthorized reproduction or use for commercial purposes is strictly prohibited.</p>
        </section>

        <section className="policy-section">
          <h2>Liability</h2>
          <p>Amritan shall not be liable for any indirect or consequential damages arising from the use of our products or website.</p>
        </section>
      </div>
    </div>
  );
};

export default React.memo(TermsAndConditions);
