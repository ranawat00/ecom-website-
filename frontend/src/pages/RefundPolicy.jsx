import React from 'react';
import { BadgeCheck } from 'lucide-react';
import '../assets/styles/Policies.css';

const RefundPolicy = () => {
  return (
    <div className="policy-page-container">
      <header className="policy-header">
        <BadgeCheck size={48} color="#D4A373" style={{ marginBottom: '16px' }} />
        <h1>Refund Policy</h1>
        <p>Transparency and trust are at the heart of our heritage brand.</p>
      </header>

      <div className="policy-content">
        <section className="policy-section">
          <h2>Refund Eligibility</h2>
          <p>Refunds are applicable in the following scenarios:</p>
          <ul>
            <li>Transit damage or breakage of product containers.</li>
            <li>Loss of shipment confirmed by our delivery partner.</li>
            <li>Incomplete order delivery (items missing from the package).</li>
            <li>Cancellation of order within the permitted 12-hour window.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>Refund Timeline</h2>
          <p>Once a refund is approved by our heritage support team, it is processed within 48 hours. The amount will reflect in your original payment method according to the following timelines:</p>
          <ul>
            <li><strong>UPI/Wallets:</strong> 2-3 business days</li>
            <li><strong>Debit/Credit Cards:</strong> 5-7 business days</li>
            <li><strong>Net Banking:</strong> 7-10 business days</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>Late or Missing Refunds</h2>
          <p>If you haven’t received a refund yet, first check your bank account again. If the issue persists, contact your credit card company or bank, as it may take some time before your refund is officially posted.</p>
        </section>

        <section className="policy-section">
          <h2>Mode of Refund</h2>
          <p>Refunds are always issued to the original mode of payment used during the order. For Cash on Delivery (COD) orders, our team will contact you to obtain your bank details for a direct bank transfer.</p>
        </section>
      </div>
    </div>
  );
};

export default React.memo(RefundPolicy);
