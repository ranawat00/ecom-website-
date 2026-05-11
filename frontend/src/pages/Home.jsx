import React from 'react';
import Hero from '../components/sections/Hero';
import Collection from '../components/sections/Collection';
import Heritage from '../components/sections/Heritage';
import Features from '../components/sections/Features';
import Featured from '../components/sections/Featured';
import Testimonials from '../components/sections/Testimonials';
import Newsletter from '../components/sections/Newsletter';

const Home = () => {
  return (
    <>
      <Hero />
      <Collection />
      <Heritage />
      <Features />
      <Featured />
      <Testimonials />
      <Newsletter />
    </>
  );
};

export default React.memo(Home);
