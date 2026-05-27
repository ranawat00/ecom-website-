import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/api';
import '../assets/styles/Contact.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSending(true);
    try {
      await api.post('/api/contact', form);
      toast.success('Message sent! We\'ll get back to you within 24 hours. 🙏');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact submit failed', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <div className="contact-hero">
        <h1>Get In Touch</h1>
        <p>We'd love to hear from you. Reach out for orders, partnerships, or just to say hello.</p>
      </div>

      <div className="contact-container">
        {/* Info Cards */}
        <div className="contact-info-strip">
          <div className="contact-info-card">
            <div className="info-icon-wrap"><MapPin size={22} /></div>
            <div>
              <strong>Visit Us</strong>
              <p>E-1/132, Madhuban Bapu Dham, Govindpuram, Ghaziabad - 201013</p>
            </div>
          </div>
          <div className="contact-info-card">
            <div className="info-icon-wrap"><Phone size={22} /></div>
            <div>
              <strong>Call Us</strong>
              <p>+91 9310971253</p>
            </div>
          </div>
          <div className="contact-info-card">
            <div className="info-icon-wrap"><Mail size={22} /></div>
            <div>
              <strong>Email Us</strong>
              <p>Maaposhan2000@gmail.com</p>
            </div>
          </div>
          <div className="contact-info-card">
            <div className="info-icon-wrap"><Clock size={22} /></div>
            <div>
              <strong>Working Hours</strong>
              <p>Mon–Sat: 9 AM – 7 PM</p>
              <p>Sunday: 10 AM – 4 PM</p>
            </div>
          </div>
        </div>

        {/* Map + Form Grid */}
        <div className="contact-grid">
          {/* Left: Google Map */}
          <div className="contact-map-section">
            <h2>Our Location</h2>
            <div className="map-wrapper">
              <iframe
                title="Amirtan Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14002.585250482813!2d77.4784!3d28.6703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cf1b593685eef%3A0x8e82ef5cd3382759!2sGovindpuram%2C%20Ghaziabad%2C%20Uttar%20Pradesh%20201013!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="map-directions">
              <a
                href="https://maps.google.com/?q=Govindpuram,Ghaziabad"
                target="_blank"
                rel="noreferrer"
                className="directions-btn"
              >
                <MapPin size={16} /> Get Directions
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="contact-form-section">
            <h2>Send a Message</h2>
            <p className="form-subtext">Fill out the form and our team will respond within 24 hours.</p>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name <span>*</span></label>
                  <input type="text" placeholder="Your full name"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+91 XXXXX XXXXX"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address <span>*</span></label>
                <input type="email" placeholder="your@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                  <option value="">Select a topic...</option>
                  <option value="order">Order Inquiry</option>
                  <option value="product">Product Information</option>
                  <option value="bulk">Bulk Order / Partnership</option>
                  <option value="complaint">Complaint / Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message <span>*</span></label>
                <textarea rows={5} placeholder="Describe your query in detail..."
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              </div>

              <button type="submit" className="contact-submit-btn" disabled={sending}>
                {sending ? 'Sending...' : <><Send size={16} /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
