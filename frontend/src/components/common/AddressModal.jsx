import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../../assets/styles/AddressModal.css';

const AddressModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    id: null,
    type: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        id: initialData.id || null,
        type: initialData.type || 'Home',
        street: initialData.street || '',
        city: initialData.city || '',
        state: initialData.state || '',
        pincode: initialData.pincode || ''
      });
    } else {
      setFormData({
        id: null,
        type: 'Home',
        street: '',
        city: '',
        state: '',
        pincode: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData.id ? 'edit' : 'add', formData);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="address-modal-overlay">
      <div className="address-modal">
        <button className="address-close-btn" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
        
        <div className="address-header">
          <h2>{formData.id ? 'Edit Address' : 'Add New Address'}</h2>
          <p>Please enter your exact location details.</p>
        </div>

        <form className="address-form" onSubmit={handleSubmit}>
          <div className="form-group-address">
            <label>Address Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group-address">
            <label>Street Address</label>
            <input type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} required placeholder="123 Example Street, Apt 4B" />
          </div>

          <div className="address-row">
            <div className="form-group-address">
              <label>City</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required placeholder="City name" />
            </div>
            <div className="form-group-address">
              <label>State</label>
              <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} required placeholder="State / Province" />
            </div>
          </div>

          <div className="form-group-address">
            <label>Pincode / Zip</label>
            <input type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} required placeholder="Enter zip code" />
          </div>

          <button type="submit" className="address-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Save Address'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default React.memo(AddressModal);
