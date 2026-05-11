import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Home, ArrowRight } from 'lucide-react';
import api from '../api/api';
import '../assets/styles/OrderSuccess.css';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order);
  const [loading, setLoading] = useState(!location.state?.order);
  const [countdown, setCountdown] = useState(5);
  const isFreshOrder = location.search.includes('fresh=true') || (!location.state?.order);

  useEffect(() => {
    // If order details are missing from state, fetch the latest order from the user
    const fetchLatestOrder = async () => {
      try {
        const data = await api.get('/api/order');
        if (data.success && data.orders.length > 0) {
          setOrder(data.orders[0]); // Most recent order
        }
      } catch (err) {
        console.error('Failed to fetch latest order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!order) {
      fetchLatestOrder();
    } else {
      setLoading(false);
    }
  }, [order]);

  useEffect(() => {
    if (!isFreshOrder) return; // Don't redirect if just viewing details

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate, isFreshOrder]);

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="order-success-card">
          <div className="success-loading">Retrieving order details...</div>
        </div>
      </div>
    );
  }

  const isCancelled = order?.status === 'Cancelled';

  return (
    <div className="order-success-page">
      <div className="order-success-card">
        <div className={`success-icon-wrapper ${isCancelled ? 'cancelled-icon' : ''}`}>
          {isCancelled ? <Package size={72} className="success-icon" style={{ opacity: 0.5 }} /> : <CheckCircle size={72} className="success-icon" />}
        </div>
        <h1>{isCancelled ? 'Order Cancelled' : 'Order Confirmed! 🎉'}</h1>
        <p className="success-subtitle">
          {isCancelled 
            ? 'This order has been successfully cancelled. We hope to serve you again soon.' 
            : 'Thank you for your purchase. Your artisanal products are being carefully packed.'}
        </p>

        {order && (
          <div className="order-details-box">
            <div className="order-id-row">
              <Package size={18} />
              <span>Order ID: <strong>{order.id}</strong></span>
              <span className={`status-badge-inline ${isCancelled ? 'status-cancelled' : ''}`}>{order.status}</span>
            </div>
            <div className="order-address-row">
              <p><strong>Delivering to:</strong> {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
            </div>
            <div className="order-items-summary">
              <h4>Items Ordered</h4>
              {order.items.map(item => (
                <div key={item.itemId} className="order-success-item">
                  <span>{item.title} {item.weight && `(${item.weight})`}</span>
                  <span>× {item.quantity} — ₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="order-total-summary">
              <span>Total Paid</span>
              <strong>₹{order.amount?.toFixed(2)}</strong>
            </div>
          </div>
        )}

        <div className="success-actions">
          <button className="btn-home" onClick={() => navigate('/')}>
            <Home size={18} /> Continue Shopping
          </button>
          <button className="btn-orders" onClick={() => navigate('/orders')}>
            View My Orders <ArrowRight size={18} />
          </button>
        </div>

        {isFreshOrder && (
          <p className="redirect-note">Redirecting to home page in {countdown} seconds...</p>
        )}

        {!isCancelled && (
          <p className="success-footer">An order confirmation has been noted. Expected delivery: 3–5 business days.</p>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;
