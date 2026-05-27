import React from 'react';
import { Leaf, HeartPulse, Truck, Award, Users, Globe } from 'lucide-react';
import '../assets/styles/About.css';

const VALUES = [
  { Icon: Leaf, title: 'Pure & Natural', desc: 'Zero chemicals, zero preservatives. Every product is crafted exactly as nature intended.' },
  { Icon: HeartPulse, title: 'Health First', desc: 'Carefully selected Ayurvedic ingredients to restore maternal health and vitality.' },
  { Icon: Truck, title: 'Direct Sourcing', desc: 'Direct partnerships with organic farmers. No middlemen, full traceability, fair wages.' },
  { Icon: Award, title: 'Heritage Quality', desc: 'Techniques passed down through generations — bilona method ghee, traditional ayurvedic preparation.' },
  { Icon: Users, title: 'Community Driven', desc: 'Supporting rural women artisans and organic farming families across India.' },
  { Icon: Globe, title: 'Sustainable Future', desc: 'Eco-friendly packaging, zero plastic, carbon-conscious delivery in every order.' },
];

const MILESTONES = [
  { year: '2018', title: 'The Beginning', desc: 'Started in a small home kitchen, sharing traditional postpartum wellness recipes with new mothers.' },
  { year: '2019', title: 'Mastering Harira', desc: 'Perfected the traditional slow-cooked Harira recipe using premium nuts, spices, and organic jaggery.' },
  { year: '2021', title: 'Online Launch', desc: 'Brought MaaPoshan to the internet — delivering traditional postpartum care across India.' },
  { year: '2023', title: '50,000+ Happy Families', desc: 'Crossed 50,000 orders milestone with a 4.9★ average customer satisfaction rating.' },
  { year: '2024', title: 'Zero Plastic', desc: 'Transitioned to 100% biodegradable, eco-friendly packaging across our entire product line.' },
];

const About = () => (
  <div className="about-page">

    {/* Hero */}
    <section className="about-hero">
      <div className="about-hero-content">
        <span className="about-hero-tag">Our Story</span>
        <h1>Restoring Strength<br />After Childbirth</h1>
        <p>
          MaaPoshan was born from a simple belief: the traditional care a mother receives after childbirth is crucial for her lifelong health. We source directly from certified organic farmers and craft Ayurvedic postpartum recovery kits to support mothers in their healing journey.
        </p>
      </div>
      <div className="about-hero-visual">
        <div className="about-hero-img-stack">
          <img src="/images/maaposhan-gifting-kit.png" alt="MaaPoshan Recovery Kit" className="hero-img hero-img-1" />
          <img src="/images/maaposhan-harira.png" alt="Pure Ayurvedic Harira" className="hero-img hero-img-2" />
        </div>
      </div>
    </section>

    {/* Mission */}
    <section className="about-mission" id="about">
      <div className="about-mission-inner">
        <div className="mission-label">Our Mission</div>
        <h2>Reviving the Wisdom of <span>Ancestral Nutrition</span></h2>
        <p>
          In a world that often overlooks postpartum recovery, we bring back the traditional care that heals from within. Our signature MaaPoshan Harira is crafted using pure chemical-free jaggery, organic bilona Desi Ghee, warming recovery spices, and premium nuts slow-cooked to perfection. Our mission is to make authentic, Ayurvedic postpartum nutrition accessible to every new mother, helping her restore energy and strength.
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
      <h2>Prioritize Your Recovery Today</h2>
      <p>Invest in authentic, traditional Ayurvedic care for your postpartum journey.</p>
      <a href="/#products" className="about-cta-btn">Explore Collection</a>
    </section>
  </div>
);

export default About;
