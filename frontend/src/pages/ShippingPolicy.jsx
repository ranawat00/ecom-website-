import React from 'react';
import { Truck } from 'lucide-react';
import '../assets/styles/Policies.css';

const ShippingPolicy = () => {
  return (
    <div className="policy-page-container">
      <header className="policy-header">
        <Truck size={48} color="#D4A373" style={{ marginBottom: '16px' }} />
        <h1>Shipping Policy</h1>
        <p>Ensuring your postpartum wellness essentials reach you safely and swiftly.</p>
      </header>

      <div className="policy-content">
        <section className="policy-section">
          <h2>Order Processing</h2>
          <p>Each MaaPoshan product is handcrafted or hand-poured upon order verification to ensure the highest quality. Please allow 1-2 business days for us to process your order before it ships.</p>
        </section>

        <section className="policy-section">
          <h2>Delivery Timelines</h2>
          <ul>
            <li><strong>Metro Cities:</strong> 3-5 business days</li>
            <li><strong>Tier 2 & 3 Cities:</strong> 5-7 business days</li>
            <li><strong>Remote Locations:</strong> Up to 10 business days</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>Shipping Charges</h2>
          <p>We offer free shipping on all orders above ₹999. For orders below this amount, a flat shipping fee of ₹99 is applied at checkout.</p>
        </section>

        <section className="policy-section">
          <h2>Safe Packaging</h2>
          <p>Since our postpartum recovery kits are often housed in traditional glass and clay-inspired containers, we use 4-layered protective wrapping to ensure zero breakage during transit. Our packaging is 80% biodegradable.</p>
        </section>

        <section className="policy-section">
          <h2>Order Tracking</h2>
          <p>Once your order is shipped, you will receive an email and SMS with a tracking number. You can also track your order directly in your <a href="/orders" style={{ color: '#D4A373' }}>Account Dashboard</a>.</p>
        </section>
      </div>
    </div>
  );
};

export default React.memo(ShippingPolicy);
