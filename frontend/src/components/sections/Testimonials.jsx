import React from 'react';
import { Quote } from 'lucide-react';
import '../../assets/styles/Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      quote: "The purity of this ghee is unmatched. It reminds me of the ghee my grandmother used to make in her village. The aroma itself tells the story of its quality.",
      author: "ANANYA SHARMA, DELHI"
    },
    {
      id: 2,
      quote: "I finally found a jaggery that doesn't have any chemical aftertaste. MaaPoshan has become a staple in our household for all our desserts.",
      author: "DR. VIKRAM MEHTA, MUMBAI"
    }
  ];

  return (
    <section className="testimonials-section">
      <div className="testimonials-header">
        <Quote className="quote-icon" fill="currentColor" size={32} strokeWidth={0} />
        <h2 className="testimonials-title">Voices of MaaPoshan</h2>
      </div>

      <div className="testimonials-list">
        {testimonials.map((item, index) => (
          <div key={item.id} className="testimonial-item">
            <p className="testimonial-quote">"{item.quote}"</p>
            <p className="testimonial-author">&mdash; {item.author}</p>
            {index < testimonials.length - 1 && <div className="testimonial-divider"></div>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(Testimonials);
