import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import '../assets/styles/Policies.css';

const FAQ = () => {
  const faqs = [
    {
      q: "Is your jaggery (Gud) completely chemical-free?",
      a: "Yes, our jaggery is made using traditional heritage methods. We use natural clarifiers like wild okra stems instead of sulfur or other chemical bleaching agents. It is 100% natural and unrefined."
    },
    {
      q: "How should I store Desi Ghee for maximum freshness?",
      a: "Desi Ghee has a long shelf life. For best results, store it in a cool, dry place away from direct sunlight. While refrigeration is not necessary, ensuring the lid is tightly sealed prevents moisture from entering."
    },
    {
      q: "How long does delivery usually take?",
      a: "We usually process orders within 1-2 business days. Depending on your location, delivery typically takes 3-7 business days across India."
    },
    {
      q: "Are the glass jars safe for shipping?",
      a: "Absolutely. We use premium, eco-friendly protective packaging specifically designed for glass. In the rare event of breakage during transit, we provide a full refund or replacement."
    },
    {
      q: "Can I use jaggery powder as a direct 1:1 substitute for white sugar?",
      a: "Yes! Our Jaggery Powder is specifically textured to be a healthy 1:1 substitute in coffee, tea, baking, and traditional desserts."
    }
  ];

  return (
    <div className="policy-page-container">
      <header className="policy-header">
        <HelpCircle size={48} color="#D4A373" style={{ marginBottom: '16px' }} />
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about our heritage products and services.</p>
      </header>

      <div className="policy-content">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <div className="faq-question">
              {faq.q}
              <ChevronDown size={20} opacity={0.5} />
            </div>
            <div className="faq-answer">
              {faq.a}
            </div>
          </div>
        ))}
        
        <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '30px' }}>
          <p>Still have questions? <a href="/contact" style={{ color: '#D4A373', fontWeight: 'bold' }}>Contact our Support Team</a></p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FAQ);
