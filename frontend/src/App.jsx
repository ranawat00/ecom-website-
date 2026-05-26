import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from './utils/analytics';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ChatAssistant from './components/common/ChatAssistant';
import ScrollToTop from './components/common/ScrollToTop';

import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Product = lazy(() => import('./pages/Product'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Orders = lazy(() => import('./pages/Orders'));
const Addresses = lazy(() => import('./pages/Addresses'));
const Profile = lazy(() => import('./pages/Profile'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const Help = lazy(() => import('./pages/Help'));

// Admin Dashboard Components
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const ProductsManager = lazy(() => import('./pages/dashboard/ProductsManager'));
const OrdersManager = lazy(() => import('./pages/dashboard/OrdersManager'));
const PaymentsManager = lazy(() => import('./pages/dashboard/PaymentsManager'));
const ReviewsManager = lazy(() => import('./pages/dashboard/ReviewsManager'));
const EnquiriesManager = lazy(() => import('./pages/dashboard/EnquiriesManager'));

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  React.useEffect(() => {
    // Record page visit
    Analytics.visit();
  }, [location.pathname]);

  return (
    <ProductProvider>
      <CartProvider>
        <div className="App" style={{ minHeight: '100vh', margin: 0, padding: 0 }}>
        <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
        {!isAdminRoute && <Navbar />}
        <ScrollToTop />
        <main>
          <Suspense fallback={<div className="loading-fallback">Loading page...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/addresses" element={<Addresses />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsAndConditions />} />
              <Route path="/help" element={<Help />} />

              {/* Admin Dashboard Routes */}
              <Route path="/admin" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="products" element={<ProductsManager />} />
                <Route path="orders" element={<OrdersManager />} />
                <Route path="payments" element={<PaymentsManager />} />
                <Route path="reviews" element={<ReviewsManager />} />
                <Route path="enquiries" element={<EnquiriesManager />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
          </Suspense>
        </main>
        {!isAdminRoute && <ChatAssistant />}
        {!isAdminRoute && <Footer />}

      </div>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;
