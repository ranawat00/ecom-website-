import React from 'react';
import { Leaf, HeartPulse, Truck, Award, Users, Globe } from 'lucide-react';
import '../assets/styles/About.css';

const VALUES = [
  { Icon: Leaf, title: 'Pure & Natural', desc: 'Zero chemicals, zero preservatives. Every product is crafted exactly as nature intended.' },
  { Icon: HeartPulse, title: 'Health First', desc: 'Packed with minerals and antioxidants. Heritage food that genuinely nourishes your body.' },
  { Icon: Truck, title: 'Farm to Table', desc: 'Direct partnerships with artisan farmers. No middlemen, full traceability, fair wages.' },
  { Icon: Award, title: 'Heritage Quality', desc: 'Techniques passed down through generations — bilona method ghee, iron-vat jaggery.' },
  { Icon: Users, title: 'Community Driven', desc: 'Supporting over 200 rural farming families across UP, Maharashtra and Karnataka.' },
  { Icon: Globe, title: 'Sustainable Future', desc: 'Eco-friendly packaging, zero plastic, carbon-conscious delivery in every order.' },
];

const MILESTONES = [
  { year: '2018', title: 'The Beginning', desc: 'Started in a small UP village kitchen, sharing heirloom jaggery recipes with neighbors.' },
  { year: '2019', title: '200+ Farmers', desc: 'Partnered with farming communities in 3 states to source the purest raw sugarcane.' },
  { year: '2021', title: 'Online Launch', desc: 'Brought Amritan to the internet — delivering heritage taste across India.' },
  { year: '2023', title: '50,000+ Happy Families', desc: 'Crossed 50,000 orders milestone with a 4.9★ average customer satisfaction rating.' },
  { year: '2024', title: 'Zero Plastic', desc: 'Transitioned to 100% biodegradable, eco-friendly packaging across our entire product line.' },
];

const About = () => (
  <div className="about-page">

    {/* Hero */}
    <section className="about-hero">
      <div className="about-hero-content">
        <span className="about-hero-tag">Our Story</span>
        <h1>Heritage in Every<br />Golden Drop</h1>
        <p>
          Amritan was born from a simple belief: the food our grandparents ate — raw, real, unprocessed —
          is still the best food there is. We source directly from artisan farmers who practice age-old
          traditions, and bring it right to your doorstep.
        </p>
      </div>
      <div className="about-hero-visual">
        <div className="about-hero-img-stack">
          <img src="/images/desi-gud-main.png" alt="Artisan Jaggery" className="hero-img hero-img-1" />
          <img src="/images/desi-ghee.png" alt="Pure Ghee" className="hero-img hero-img-2" />
        </div>
      </div>
    </section>

    {/* Mission */}
    <section className="about-mission" id="about">
      <div className="about-mission-inner">
        <div className="mission-label">Our Mission</div>
        <h2>Reviving the Wisdom of <span>Ancestral Nutrition</span></h2>
        <p>
          In a world flooded with ultra-processed food, we bring back the original superfoods.
          Jaggery that remembers sugarcane. Ghee that remembers the cow. Spices that remember the soil.
          Our mission is to make pure, traditional Indian nutrition accessible to every household
          without compromising on authenticity, quality, or farmer welfare.
        </p>
        <div className="mission-stats">
          <div className="stat-item"><strong>50K+</strong><span>Happy Families</span></div>
          <div className="stat-item"><strong>200+</strong><span>Partner Farmers</span></div>
          <div className="stat-item"><strong>4.9★</strong><span>Average Rating</span></div>
          <div className="stat-item"><strong>100%</strong><span>Natural Products</span></div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="about-values">
      <div className="about-section-header">
        <span className="section-tag">What We Stand For</span>
        <h2>Our Core Values</h2>
      </div>
      <div className="values-grid">
        {VALUES.map(({ Icon, title, desc }) => (
          <div key={title} className="value-card">
            <div className="value-icon"><Icon size={28} /></div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Timeline */}
    <section className="about-timeline">
      <div className="about-section-header">
        <span className="section-tag">Our Journey</span>
        <h2>Milestones That Matter</h2>
      </div>
      <div className="timeline">
        {MILESTONES.map((m, i) => (
          <div key={m.year} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
            <div className="timeline-content">
              <span className="timeline-year">{m.year}</span>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </div>
            <div className="timeline-dot" />
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="about-cta">
      <h2>Taste the Difference Today</h2>
      <p>Join thousands of families making the switch to natural, heritage food.</p>
      <a href="/#products" className="about-cta-btn">Explore Collection</a>
    </section>
  </div>
);

export default About;
