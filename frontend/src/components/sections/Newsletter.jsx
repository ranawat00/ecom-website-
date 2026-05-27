import React, { useState } from 'react';
import '../../assets/styles/Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(loading) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/subscribers/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage(data.message);
        setEmail('');
      } else {
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setMessage('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        {/* Subtle patterned overlay injected by CSS background */}
        <div className="newsletter-content">
          <h2 className="newsletter-title">Join the MaaPoshan Circle</h2>
          <p className="newsletter-description">
            Receive exclusive postpartum recipes, Ayurvedic recovery tips, and early access to our limited batches.
          </p>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input 
              type="email" 
              className="newsletter-input" 
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <button type="submit" className="newsletter-submit" disabled={loading}>
              {loading ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
            </button>
          </form>
          {message && <p className={`newsletter-message ${message.includes('Success') || message.includes('Welcome') ? 'success' : 'error'}`}>{message}</p>}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Newsletter);
