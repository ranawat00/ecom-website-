import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Plus, Edit2, Trash2, ArrowLeft, Home as Neighborhood, Briefcase, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/api';
import AddressModal from '../components/common/AddressModal';
import '../assets/styles/Addresses.css';

const Addresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await api.get('/api/address');
      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
      toast.error('Could not load your addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      if (!localStorage.getItem('token')) {
        navigate('/');
      }
    };
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, [navigate]);

  const fetchedRef = React.useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      toast.error('Please login to manage your addresses');
      return;
    }
    
    if (!fetchedRef.current) {
      fetchAddresses();
      fetchedRef.current = true;
    }
    window.scrollTo(0, 0);
  }, [fetchAddresses, navigate]);

  const handleSaveAddress = async (action, formData) => {
    try {
      let response;
      if (action === 'add') {
        response = await api.post('/api/address', formData);
      } else {
        response = await api.put(`/api/address/${formData.id}`, formData);
      }

      if (response.success) {
        toast.success(response.message);
        if (action === 'add') {
          setAddresses(prev => [...prev, response.address]);
        } else {
          setAddresses(prev => prev.map(a => a.id === formData.id ? response.address : a));
        }
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save address', err);
      toast.error('Failed to save changes');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const data = await api.delete(`/api/address/${id}`);
      if (data.success) {
        toast.success(data.message);
        setAddresses(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete address', err);
      toast.error('Could not delete address');
    }
  };

  const openModal = (address = null) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'home': return <Neighborhood size={16} />;
      case 'work': return <Briefcase size={16} />;
      default: return <Globe size={16} />;
    }
  };

  return (
    <div className="addresses-page-container">
      <div className="addresses-content-wrapper">
        <Link to="/" className="back-home-link">
          <ArrowLeft size={18} />
          <span>Back to Shop</span>
        </Link>
        
        <header className="addresses-header">
          <div className="header-text">
            <h1>My Saved Addresses</h1>
            <p>Manage your delivery locations for faster checkout</p>
          </div>
          <button className="add-address-btn-fancy" onClick={() => openModal(null)}>
            <Plus size={20} />
            Add New Address
          </button>
        </header>

        {loading ? (
          <div className="addresses-loading">
            <div className="spinner"></div>
            <p>Fetching your locations...</p>
          </div>
        ) : addresses.length > 0 ? (
          <div className="addresses-grid">
            {addresses.map((addr) => (
              <div key={addr.id} className="address-card-premium">
                <div className="card-top-info">
                  <div className="card-type-badge">
                    {getTypeIcon(addr.type)}
                    <span style={{ marginLeft: '4px' }}>{addr.type || 'Home'}</span>
                  </div>
                  <div className="address-details">
                    <h3>{addr.street}</h3>
                    <p>{addr.city}, {addr.state}</p>
                    <div className="pincode-badge">
                      <MapPin size={14} />
                      {addr.pincode}
                    </div>
                  </div>
                </div>

                <div className="card-actions-row">
                  <button className="action-btn edit" onClick={() => openModal(addr)}>
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button className="action-btn delete" onClick={() => handleDeleteAddress(addr.id)}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="addresses-empty">
            <MapPin size={64} strokeWidth={1} color="var(--accent-gold)" />
            <h2>No Saved Addresses</h2>
            <p>You haven't added any delivery locations yet. Add one to speed up your future orders!</p>
            <button className="add-address-btn-fancy" style={{ margin: '0 auto' }} onClick={() => openModal(null)}>
              <Plus size={20} />
              Add Your First Address
            </button>
          </div>
        )}
      </div>

      <AddressModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedAddress}
        onSave={handleSaveAddress}
      />
    </div>
  );
};

export default Addresses;
