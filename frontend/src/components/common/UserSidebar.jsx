import React, { useState, useEffect, useCallback } from 'react';
import { User, MapPin, Package, LogOut, X, HelpCircle, ChevronLeft, Search, Phone, MessageSquare, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';


import { useCart } from '../../context/CartContext';
import '../../assets/styles/UserSidebar.css';
import { useNavigate } from 'react-router-dom';
import OrderTracker from '../orders/OrderTracker';


const UserSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { setIsCartOpen } = useCart();
  const [user, setUser] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.get('/api/auth/profile');
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, fetchProfile]);


  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout recording failed', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('loginTimestamp');
      setUser(null);
      toast.info('You have securely logged out.');
      window.dispatchEvent(new Event('authChange'));
      onClose();
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    onClose();
  };

  const navigateToOrders = () => {
    navigate('/orders');
    onClose();
  };

  const navigateToAddresses = () => {
    navigate('/addresses');
    onClose();
  };

  const navigateToHelp = () => {
    navigate('/help');
    onClose();
  };

  // --- Render Views ---

  const renderMenu = () => (
    <>
      <div className="sidebar-menu">
        {user && user.role === 'admin' && (
          <button
            className="menu-item"
            onClick={() => { navigate('/admin'); onClose(); }}
            style={{
              background: 'linear-gradient(135deg, rgba(107, 29, 47, 0.08) 0%, rgba(197, 168, 128, 0.08) 100%)',
              border: '1px solid rgba(197, 168, 128, 0.3)',
              marginBottom: '10px'
            }}
          >
            <User size={20} color="#6B1D2F" />
            <span style={{ fontWeight: '700', color: '#6B1D2F' }}>Admin Dashboard</span>
          </button>
        )}
        <button className="menu-item" onClick={handleProfileClick}>
          <User size={20} />
          <span>Profile Details</span>
        </button>
        <button className="menu-item" onClick={navigateToAddresses}>
          <MapPin size={20} />
          <span>Saved Addresses</span>
        </button>
        <button className="menu-item" onClick={navigateToOrders}>
          <Package size={20} />
          <span>Order History</span>
        </button>
        <button className="menu-item" onClick={navigateToHelp}>
          <HelpCircle size={20} />
          <span>Help & Support</span>
        </button>
      </div>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} /><span>Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`user-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
          <div className="user-info">
            <div className="user-avatar"><User size={32} color="#fff" /></div>
            <h3>{user ? user.username : 'Welcome back!'}</h3>
            <p>{user ? user.email : 'Heritage Premium Member'}</p>
          </div>
        </div>
        {renderMenu()}
      </div>
    </>
  );
};

export default React.memo(UserSidebar);
