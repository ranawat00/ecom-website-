import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Eye, 
  X, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  Calendar,
  Package
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../assets/styles/Dashboard.css';

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // Details Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.get('/api/admin/orders');
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('[AdminOrders] Fetch failed:', err);
      toast.error('Failed to load customer orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update fulfillment status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        toast.success(`Fulfillment state updated to: ${newStatus}`);
        
        // Update local state to avoid full reload
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        
        // Update selected order in drawer if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('[AdminOrders] Status update failed:', err);
      toast.error('Failed to update fulfillment state.');
    }
  };

  // Open drawer inspector
  const handleInspect = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  // Filters
  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    const orderId = (order.id || order.mongoId || '').toString().toLowerCase();
    const customer = (order.customer || 'Guest').toLowerCase();
    const email = (order.email || 'N/A').toLowerCase();
    const searchVal = search.toLowerCase();

    const matchesSearch = 
      orderId.includes(searchVal) ||
      customer.includes(searchVal) ||
      email.includes(searchVal);
      
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered': return 'badge-paid';
      case 'Cancelled': return 'badge-danger';
      case 'Processing': return 'badge-warning';
      case 'In Transit': case 'Out for Delivery': return 'badge-cod';
      default: return 'badge-pending';
    }
  };

  return (
    <>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Order Fulfillment Desk</h1>
          <p>Track, audit and update order fulfillment processes.</p>
        </div>
      </div>

      {/* Main card */}
      <div className="dashboard-card">
        {/* Search & Filters */}
        <div className="filters-row">
          <div className="search-input-wrap">
            <Search />
            <input 
              type="text" 
              placeholder="Search by order ID, customer name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-dashboard"
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Statuses</option>
            <option value="Order Placed">Order Placed</option>
            <option value="Processing">Processing</option>
            <option value="In Transit">In Transit</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table list */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Placed Date</th>
                <th>Order Total</th>
                <th>Payment Method</th>
                <th>Fulfillment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#6B1D2F', fontWeight: '600' }}>
                    Loading customer transactions...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#8C7A7C' }}>
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  if (!order) return null;
                  const orderId = order.id || order.mongoId || 'N/A';
                  const customerName = order.customer || 'Guest';
                  const customerEmail = order.email || 'N/A';
                  const paymentMethod = order.paymentMethod || 'COD';
                  const amountVal = typeof order.amount === 'number' ? order.amount : 0;
                  const displayDate = order.date 
                    ? new Date(order.date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) 
                    : 'N/A';
                  const orderStatus = order.status || 'Order Placed';

                  return (
                    <tr key={orderId}>
                      <td style={{ fontWeight: '700', color: '#6B1D2F' }}>{orderId}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8C7A7C' }}>{customerEmail}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#8C7A7C' }}>
                        {displayDate}
                      </td>
                      <td style={{ fontWeight: '700' }}>₹{amountVal.toFixed(2)}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: '#FAF5EE', border: '1px solid var(--accent-color)' }}>
                          {paymentMethod}
                        </span>
                      </td>
                      <td>
                        <select 
                          value={orderStatus} 
                          onChange={(e) => handleUpdateStatus(orderId, e.target.value)}
                          className={`badge ${getStatusBadgeClass(orderStatus)}`}
                          style={{ border: 'none', cursor: 'pointer', outline: 'none', paddingRight: '8px' }}
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button 
                          className="btn-action-view" 
                          title="Inspect Order Items"
                          onClick={() => handleInspect(order)}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Details Slide-over Drawer ── */}
      {drawerOpen && selectedOrder && (
        <div className="details-drawer-overlay" onClick={(e) => e.target === e.currentTarget && setDrawerOpen(false)}>
          <div className="details-drawer">
            <div className="drawer-header">
              <h3>📦 Order Inspection</h3>
              <button className="modal-close-btn" onClick={() => setDrawerOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Basic Info Grid */}
            <div className="drawer-section">
              <h4>Order Metadata</h4>
              <div className="drawer-grid">
                <div className="drawer-grid-item">
                  <label>Order ID</label>
                  <span>{selectedOrder.id || 'N/A'}</span>
                </div>
                <div className="drawer-grid-item">
                  <label>Total Price</label>
                  <span style={{ color: '#6B1D2F', fontWeight: '700' }}>₹{(typeof selectedOrder.amount === 'number' ? selectedOrder.amount : 0).toFixed(2)}</span>
                </div>
                <div className="drawer-grid-item">
                  <label>Payment Method</label>
                  <span>{selectedOrder.paymentMethod || 'COD'}</span>
                </div>
                <div className="drawer-grid-item">
                  <label>Payment Ref ID</label>
                  <span style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{selectedOrder.paymentId || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="drawer-section">
              <h4>Customer Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(197, 168, 128, 0.04)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(197, 168, 128, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                  <User size={16} color="#C5A880" />
                  <strong>{selectedOrder.customer || 'Guest'}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#8C7A7C' }}>
                  <Mail size={16} />
                  <span>{selectedOrder.email || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#8C7A7C' }}>
                  <Phone size={16} />
                  <span>{selectedOrder.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="drawer-section">
              <h4>Shipping Destination</h4>
              <div style={{ display: 'flex', gap: '12px', background: 'rgba(197, 168, 128, 0.04)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(197, 168, 128, 0.1)' }}>
                <MapPin size={20} color="#6B1D2F" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>
                  <strong>{selectedOrder.address?.firstName || ''} {selectedOrder.address?.lastName || ''}</strong><br />
                  {selectedOrder.address?.streetAddress || ''}{selectedOrder.address?.apartmentSuite ? `, ${selectedOrder.address.apartmentSuite}` : ''}<br />
                  {selectedOrder.address?.city || ''}, {selectedOrder.address?.state || ''} - {selectedOrder.address?.zipCode || ''}<br />
                  {selectedOrder.address?.deliveryPhone && <strong>Phone: {selectedOrder.address.deliveryPhone}</strong>}
                </div>
              </div>
            </div>

            {/* Ordered Items list */}
            <div className="drawer-section" style={{ flex: 1 }}>
              <h4>Ordered Jaggery Items ({selectedOrder.items?.length || 0})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedOrder.items?.map((item, idx) => {
                  const title = item.title || 'Jaggery Product';
                  const weight = item.weight || '500g';
                  const quantity = item.quantity || 1;
                  const price = typeof item.price === 'number' ? item.price : 0;
                  
                  return (
                    <div key={idx} className="drawer-item-row">
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <img 
                          src={item.image || '/images/logo.png'} 
                          alt={title} 
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.06)' }}
                        />
                        <div className="drawer-item-info">
                          <h5>{title}</h5>
                          <span>{weight} x {quantity}</span>
                        </div>
                      </div>
                      <div className="drawer-item-price">
                        ₹{(price * quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Status actions */}
            <div className="drawer-section" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Fulfillment State:</span>
                <select 
                  value={selectedOrder.status || 'Order Placed'} 
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  className={`badge ${getStatusBadgeClass(selectedOrder.status)}`}
                  style={{ border: 'none', cursor: 'pointer', outline: 'none', fontSize: '0.9rem', padding: '8px 16px' }}
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersManager;
