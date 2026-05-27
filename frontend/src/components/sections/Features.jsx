import React, { useEffect, useRef, useState } from 'react';
import { Leaf, Hand, Tractor } from 'lucide-react';
import '../../assets/styles/Features.css';

const useIntersectionObserver = (options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.unobserve(entry.target);
      }
    }, options);

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [options]);

  return [ref, isIntersecting];
};

const Features = () => {
  const [ref, inView] = useIntersectionObserver({ threshold: 0.2 });

  const featureData = [
    {
      icon: <Leaf className="feature-icon" />,
      title: 'No Additives',
      description: 'Sourced from certified organic farms, strictly free from synthetic chemicals, artificial colors, and preservatives.',
    },
    {
      icon: <Hand className="feature-icon" />,
      title: 'Slow-Cooked',
      description: 'Prepared in small artisanal batches following traditional postpartum recipe systems for complete bioavailability.',
    },
    {
      icon: <Tractor className="feature-icon" />,
      title: 'MaaPoshan Harira',
      description: 'Our signature postpartum recovery paste slow-cooked using authentic Bilona Desi Ghee, essential for joint health, tissue recovery, and maternal strength.',
    }
  ];


  return (
    <section className="features-wrapper">
      <div className="features-inner">
        <div className="features-grid" ref={ref}>
          {featureData.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-item ${inView ? 'animate' : ''}`}
              style={{ transitionDelay: `${index * 0.2}s` }}
            >
              <div className="feature-icon-circle">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Features);
