import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Clock, ArrowLeft, ShoppingBag, 
  Calendar, Info, MapPin, ChevronRight, 
  CheckCircle2, Truck, Timer, Search, Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/api';
import OrderTracker from '../components/orders/OrderTracker';
import '../assets/styles/Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });


  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.get('/api/order');
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
      toast.error('Could not load your orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchedRef = React.useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      toast.error('Please login to view your orders');
      return;
    }
    
    if (!fetchedRef.current) {
      fetchOrders();
      fetchedRef.current = true;
    }
    window.scrollTo(0, 0);
  }, [fetchOrders, navigate]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Delivered':
        return { icon: <CheckCircle2 size={16} />, className: 'status-delivered', label: 'Delivered', color: '#2ecc71' };
      case 'In Transit':
        return { icon: <Truck size={16} />, className: 'status-transit', label: 'In Transit', color: '#3498db' };
      case 'Out for Delivery':
        return { icon: <Timer size={16} />, className: 'status-out', label: 'Out for Delivery', color: '#f1c40f' };
      case 'Cancelled':
        return { icon: <Info size={16} />, className: 'status-cancelled', label: 'Cancelled', color: '#e74c3c' };
      default:
        return { icon: <Clock size={16} />, className: 'status-placed', label: 'Order Placed', color: '#9b59b2' };
    }
  };

  const [processingOrders, setProcessingOrders] = useState(new Set());

  const handleCancel = async (orderId) => {
    if (processingOrders.has(orderId)) return;
    setCancelModal({ isOpen: true, orderId });
  };

  const confirmCancel = async () => {
    const orderId = cancelModal.orderId;
    if (!orderId) return;

    setCancelModal({ isOpen: false, orderId: null });

    setProcessingOrders(prev => new Set(prev).add(orderId));
    try {
      console.log(`Sending cancel request for order: ${orderId}`);
      const data = await api.post(`/api/order/${orderId}/cancel`);
      console.log('Cancel response:', data);
      if (data.success) {
        toast.success('Order cancelled successfully');
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: 'Cancelled' } : o));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel order';
      toast.error(msg);
    } finally {
      setProcessingOrders(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase().trim().replace('#', ''); 
    const matchesSearch = 
      !term || 
      (o.orderId && o.orderId.toLowerCase().includes(term)) ||
      (o.paymentId && o.paymentId.toLowerCase().includes(term)) ||
      (o.items && o.items.some(item => 
        item.title && item.title.toLowerCase().includes(term)
      )) ||
      (o.address && (
        (o.address.name && o.address.name.toLowerCase().includes(term)) ||
        (o.address.city && o.address.city.toLowerCase().includes(term)) ||
        (o.address.area && o.address.area.toLowerCase().includes(term))
      ));
    
    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Ongoing') {
      const ongoingStatuses = ['Order Placed', 'Processing', 'In Transit', 'Out for Delivery'];
      return matchesSearch && ongoingStatuses.includes(o.status);
    }
    return matchesSearch && o.status === statusFilter;
  });

  return (
    <div className="orders-premium-container">
      <div className="orders-max-width">
        <header className="orders-hero-header">
          <div className="header-nav">
            <button className="minimal-back-btn" onClick={() => navigate('/')}>
              <ArrowLeft size={18} /> Back to Boutique
            </button>
          </div>
          <div className="header-content">
            <h1>My Order Legacy</h1>
            <p>Tracing your collection of artisanal heritage products</p>
          </div>
          
          <div className="orders-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by ID or Product..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-dropdown-wrap">
              <button className={`filter-btn ${isFilterOpen ? 'active' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                <Filter size={18} /> <span>{statusFilter}</span>
              </button>
              {isFilterOpen && (
                <div className="filter-menu">
                  {['All', 'Ongoing', 'Delivered', 'Order Placed', 'Cancelled'].map(f => (
                    <div 
                      key={f} 
                      className={`filter-item ${statusFilter === f ? 'selected' : ''}`}
                      onClick={() => { setStatusFilter(f); setIsFilterOpen(false); }}
                    >
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="orders-skeleton-wrap">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card"></div>)}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="orders-stack">
            {filteredOrders.map((order) => {
              const status = getStatusConfig(order.status);
              const isCancellable = ['Order Placed', 'Processing'].includes(order.status);
              return (
                <div key={order.id} className="order-modern-card">
                  <div className="card-inner">
                    <div className="order-top-bar">
                      <div className="order-identity">
                        <span className="order-id-label">Order</span>
                        <h3 className="order-id-value">#{order.orderId}</h3>
                      </div>
                      <div className={`status-chip ${status.className}`}>
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                    </div>

                    <div className="card-tracker-live">
                      <OrderTracker status={order.status} />
                    </div>

                    <div className="order-grid">
                      <div className="order-items-column">
                        <div className="items-compact-grid">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="item-row-minimal">
                              <div className="item-thumb">
                                <img src={item.image} alt={item.title} />
                                <span className="item-qty-badge">{item.quantity}</span>
                              </div>
                              <div className="item-text">
                                <span className="item-name">{item.title}</span>
                                <span className="item-specs">{item.weight} • ₹{item.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="order-details-column">
                        <div className="detail-group">
                          <div className="detail-item">
                            <Calendar size={14} />
                            <span>Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                          <div className="detail-item">
                            <MapPin size={14} />
                            <span>Shipping to {order.address.city}</span>
                          </div>
                        </div>
                        
                        <div className="amount-card">
                          <span className="amount-label">Total Investment</span>
                          <span className="amount-value">₹{order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="order-action-bar">
                      <div className="action-bar-left">
                        {isCancellable && (
                          <button 
                            className="cancel-order-btn" 
                            onClick={() => handleCancel(order.orderId)}
                            disabled={processingOrders.has(order.orderId)}
                          >
                            {processingOrders.has(order.orderId) ? 'Cancelling...' : 'Cancel Order'}
                          </button>
                        )}
                        <div className="tracking-preview">
                          <div className={`tracker-dot ${order.status === 'Cancelled' ? 'inactive' : 'active'}`}></div>
                          <span className="tracker-text">{order.status}</span>
                        </div>
                      </div>
                      <button className="action-btn-primary" onClick={() => navigate(`/order-success`, { state: { order } })}>
                        Track & Details <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="orders-empty-state">
            <div className="empty-icon-ring">
              <ShoppingBag size={40} />
            </div>
            <h2>No Orders Captured</h2>
            <p>Your journey into artisanal heritage begins with your first purchase.</p>
            <button className="luxury-shop-btn" onClick={() => navigate('/products')}>
              Explore Collections
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {cancelModal.isOpen && (
        <div className="cancel-modal-overlay" onClick={() => setCancelModal({ isOpen: false, orderId: null })}>
          <div className="cancel-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-header">
              <Info size={32} color="#e74c3c" />
            </div>
            <h2>Confirm Cancellation</h2>
            <p>Are you sure you want to cancel order <strong>#{cancelModal.orderId}</strong>? This action is irreversible.</p>
            <div className="modal-actions">
              <button 
                className="modal-btn-secondary" 
                onClick={() => setCancelModal({ isOpen: false, orderId: null })}
              >
                No, Keep Order
              </button>
              <button 
                className="modal-btn-danger" 
                onClick={confirmCancel}
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Orders;
