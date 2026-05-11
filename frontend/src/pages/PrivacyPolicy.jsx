import React from 'react';
import { ShieldCheck } from 'lucide-react';
import '../assets/styles/Policies.css';

const PrivacyPolicy = () => {
  return (
    <div className="policy-page-container">
      <header className="policy-header">
        <ShieldCheck size={48} color="#D4A373" style={{ marginBottom: '16px' }} />
        <h1>Privacy Policy</h1>
        <p>Your trust is our greatest heritage. How we protect your data.</p>
      </header>

      <div className="policy-content">
        <section className="policy-section">
          <h2>Data Collection</h2>
          <p>We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This includes your name, phone number, delivery address, and optional email.</p>
        </section>

        <section className="policy-section">
          <h2>How We Use Your Data</h2>
          <p>Your data is used primarily to process orders, send delivery updates via SMS/OTP, and improve our services. We do not sell your personal information to third parties.</p>
        </section>

        <section className="policy-section">
          <h2>Secure Transactions</h2>
          <p>Payment information is processed securely through Razorpay. We do not store your credit card or bank details on our servers.</p>
        </section>

        <section className="policy-section">
          <h2>Cookies</h2>
          <p>We use essential cookies to maintain your login session and cart state. You can disable cookies in your browser settings, though some features of the site may not function correctly.</p>
        </section>
      </div>
    </div>
  );
};

export default React.memo(PrivacyPolicy);
