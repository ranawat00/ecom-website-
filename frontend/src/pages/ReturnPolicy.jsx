import React from 'react';
import { RotateCcw } from 'lucide-react';
import '../assets/styles/Policies.css';

const ReturnPolicy = () => {
  return (
    <div className="policy-page-container">
      <header className="policy-header">
        <RotateCcw size={48} color="#D4A373" style={{ marginBottom: '16px' }} />
        <h1>Return Policy</h1>
        <p>Your satisfaction is our deepest heritage. Here is how we handle returns.</p>
      </header>

      <div className="policy-content">
        <section className="policy-section">
          <h2>Food Safety & Returns</h2>
          <p>Due to the nature of our products (postpartum recovery items being food & wellness items), we cannot accept returns once the vacuum seal or tamper-evident seal has been broken. This is to ensure the complete safety and hygiene of our products for all our customers.</p>
        </section>

        <section className="policy-section">
          <h2>Damaged or Wrong Items</h2>
          <p>If you receive a product that is damaged, leaking, or if it is the wrong item (different weight or variant), we will provide an immediate replacement or full refund.</p>
          <ul>
            <li>Please report the issue within 48 hours of delivery.</li>
            <li>Sharing a photograph of the damaged item is mandatory for processing the claim.</li>
            <li>Replacement items will be dispatched within 48 hours of claim approval.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>How to Initiate a Request</h2>
          <p>simply email our heritage support team at <strong>support@maaposhan.com</strong> or message us on WhatsApp at <strong>+91 XXXXX XXXXX</strong> with your Order ID and the reason for the request.</p>
        </section>

        <section className="policy-section">
          <h2>Cancellation</h2>
          <p>Orders can only be cancelled within 12 hours of being placed, as we begin hand-pouring and packaging our products immediately to ensure freshness.</p>
        </section>
      </div>
    </div>
  );
};

export default React.memo(ReturnPolicy);
