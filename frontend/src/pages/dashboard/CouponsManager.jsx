import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Tag, 
  Calendar, 
  Percent, 
  DollarSign, 
  ShoppingBag,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../assets/styles/Dashboard.css';
import ConfirmModal from '../../components/common/ConfirmModal';

const CouponsManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ show: false, coupon: null });
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ─── Modal Form State ───
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '0',
    maxDiscount: '',
    applicableProducts: [],
    startDate: '',
    endDate: '',
    usageLimit: '',
    isActive: true
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch both coupons and products in parallel
      const [couponsRes, productsRes] = await Promise.all([
        api.get('/api/coupons'),
        api.get('/api/products')
      ]);

      if (couponsRes.success) {
        setCoupons(couponsRes.coupons || []);
      }
      if (productsRes.success) {
        // Handle products response structure: it can be under products list
        setProducts(productsRes.products || []);
      }
    } catch (err) {
      console.error('[CouponsManager] Fetch failed:', err);
      toast.error('Failed to load coupon configurations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingId(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '10',
      minPurchase: '0',
      maxDiscount: '',
      applicableProducts: [],
      startDate: today,
      endDate: nextMonth,
      usageLimit: '100',
      isActive: true
    });
    setModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (coupon) => {
    setEditingId(coupon.id || coupon._id);
    
    const startFormatted = coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '';
    const endFormatted = coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '';

    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase.toString(),
      maxDiscount: coupon.maxDiscount ? coupon.maxDiscount.toString() : '',
      applicableProducts: coupon.applicableProducts || [],
      startDate: startFormatted,
      endDate: endFormatted,
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      isActive: coupon.isActive
    });
    setModalOpen(true);
  };

  // Toggle single product in multi-selection
  const handleToggleProduct = (productId) => {
    setFormData(prev => {
      const exists = prev.applicableProducts.includes(productId);
      const updated = exists
        ? prev.applicableProducts.filter(id => id !== productId)
        : [...prev.applicableProducts, productId];
      return { ...prev, applicableProducts: updated };
    });
  };

  // Toggle active status directly from table row (convenient shortcut)
  const handleToggleActive = async (coupon) => {
    const id = coupon.id || coupon._id;
    try {
      const res = await api.put(`/api/coupons/${id}`, {
        isActive: !coupon.isActive
      });
      if (res.success) {
        toast.success(`Coupon "${coupon.code}" ${!coupon.isActive ? 'activated' : 'deactivated'}.`);
        fetchData();
      }
    } catch (err) {
      console.error('[CouponsManager] Status toggle failed:', err);
      toast.error('Failed to update status.');
    }
  };

  // Submit Coupon Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      code: formData.code.toUpperCase().trim(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minPurchase: parseFloat(formData.minPurchase || '0'),
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      applicableProducts: formData.applicableProducts,
      startDate: formData.startDate,
      endDate: formData.endDate,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      isActive: formData.isActive
    };

    if (isNaN(payload.discountValue) || payload.discountValue <= 0) {
      toast.error('Please enter a valid discount value greater than 0.');
      return;
    }

    try {
      if (editingId) {
        const res = await api.put(`/api/coupons/${editingId}`, payload);
        if (res.success) {
          toast.success('Coupon updated successfully!');
          setModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.post('/api/coupons', payload);
        if (res.success) {
          toast.success('New Coupon published successfully!');
          setModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error('[CouponsManager] Submit failed:', err);
      const msg = err.response?.data?.message || 'Failed to save coupon rules.';
      toast.error(msg);
    }
  };

  // Delete Coupon
  const handleDelete = (coupon) => {
    setConfirmModal({ show: true, coupon });
  };

  const executeDelete = async () => {
    if (!confirmModal.coupon) return;
    const id = confirmModal.coupon.id || confirmModal.coupon._id;
    try {
      const res = await api.delete(`/api/coupons/${id}`);
      if (res.success) {
        toast.success('Coupon deleted successfully.');
        fetchData();
      }
    } catch (err) {
      console.error('[CouponsManager] Delete failed:', err);
      toast.error('Failed to delete coupon.');
    } finally {
      setConfirmModal({ show: false, coupon: null });
    }
  };

  // Filters
  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(search.toLowerCase()) ||
    coupon.discountType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Coupon & Discount Manager</h1>
          <p>Create promotional codes, limit them to specific postpartum kits, and configure dynamic discounts.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary-dashboard" onClick={handleOpenAdd}>
            <Plus size={18} /> Add New Coupon
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(107, 29, 47, 0.08)', color: '#6B1D2F' }}>
            <Tag size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#8C7A7C' }}>Total Coupons</h4>
            <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#3C2226' }}>{coupons.length}</p>
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(76, 175, 80, 0.08)', color: '#4CAF50' }}>
            <Check size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#8C7A7C' }}>Active Coupons</h4>
            <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#4CAF50' }}>{coupons.filter(c => c.isActive).length}</p>
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(197, 168, 128, 0.08)', color: '#C5A880' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#8C7A7C' }}>Product Specific</h4>
            <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#3C2226' }}>{coupons.filter(c => c.applicableProducts?.length > 0).length}</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="dashboard-card">
        {/* Filters Row */}
        <div className="filters-row">
          <div className="search-input-wrap">
            <Search />
            <input 
              type="text" 
              placeholder="Search by coupon code (e.g. WELCOME10)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-dashboard"
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: '#8C7A7C', fontWeight: '600' }}>
            Showing {filteredCoupons.length} of {coupons.length} Coupons
          </span>
        </div>

        {/* Coupon Listing Table */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount Details</th>
                <th>Min Purchase</th>
                <th>Applicable Products</th>
                <th>Validity Dates</th>
                <th>Usage Status</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#6B1D2F', fontWeight: '600' }}>
                    Loading coupons list...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#8C7A7C' }}>
                    No coupons created yet. Create your first coupon code!
                  </td>
                </tr>
              ) : (
                filteredCoupons.map(coupon => {
                  const now = new Date();
                  const isExpired = new Date(coupon.endDate) < now;
                  const isStarted = new Date(coupon.startDate) <= now;
                  
                  let dateBadge = 'Active';
                  let dateBadgeColor = '#4CAF50';
                  let dateBadgeBg = 'rgba(76, 175, 80, 0.1)';

                  if (isExpired) {
                    dateBadge = 'Expired';
                    dateBadgeColor = '#F44336';
                    dateBadgeBg = 'rgba(244, 67, 54, 0.1)';
                  } else if (!isStarted) {
                    dateBadge = 'Upcoming';
                    dateBadgeColor = '#FF9800';
                    dateBadgeBg = 'rgba(255, 152, 0, 0.1)';
                  }

                  return (
                    <tr key={coupon.id || coupon._id}>
                      <td style={{ fontWeight: '800', letterSpacing: '0.5px' }}>
                        <span style={{
                          backgroundColor: '#6B1D2F',
                          color: '#FDFBF7',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontSize: '0.95rem',
                          border: '1px dashed #C5A880'
                        }}>
                          {coupon.code}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700', color: '#3C2226' }}>
                        {coupon.discountType === 'percentage' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Percent size={14} color="#6B1D2F" /> {coupon.discountValue}% Off
                            {coupon.maxDiscount ? ` (Up to ₹${coupon.maxDiscount})` : ''}
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ₹{coupon.discountValue} Flat Discount
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {coupon.minPurchase > 0 ? `₹${coupon.minPurchase}` : 'None'}
                      </td>
                      <td>
                        {coupon.applicableProducts && coupon.applicableProducts.length > 0 ? (
                          <span className="badge" style={{ backgroundColor: 'rgba(197, 168, 128, 0.12)', color: '#6B1D2F', border: '1px solid rgba(197,168,128,0.25)' }}>
                            🎯 {coupon.applicableProducts.length} Product{coupon.applicableProducts.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="badge" style={{ backgroundColor: 'rgba(76, 175, 80, 0.08)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.2)' }}>
                            🌍 Global
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#555' }}>
                            <Calendar size={12} /> {new Date(coupon.startDate).toLocaleDateString()} to
                          </span>
                          <span style={{ color: '#555', paddingLeft: '16px' }}>
                            {new Date(coupon.endDate).toLocaleDateString()}
                          </span>
                          <span style={{
                            alignSelf: 'flex-start',
                            fontSize: '0.75rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            color: dateBadgeColor,
                            backgroundColor: dateBadgeBg,
                            fontWeight: 'bold',
                            marginTop: '2px'
                          }}>
                            {dateBadge}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{coupon.usedCount} Uses</span>
                          {coupon.usageLimit ? (
                            <span style={{ fontSize: '0.75rem', color: '#8C7A7C' }}>Limit: {coupon.usageLimit}</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#4CAF50' }}>Unlimited</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleToggleActive(coupon)}
                          style={{
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s',
                            backgroundColor: coupon.isActive ? 'rgba(76, 175, 80, 0.15)' : 'rgba(140, 122, 124, 0.15)',
                            color: coupon.isActive ? '#4CAF50' : '#8C7A7C',
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: coupon.isActive ? '#4CAF50' : '#8C7A7C' }} />
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-action-edit" title="Edit Coupon" onClick={() => handleOpenEdit(coupon)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-action-delete" title="Delete Coupon" onClick={() => handleDelete(coupon)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Slide-Over Add/Edit Drawer ── */}
      {modalOpen && (
        <div className="dashboard-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="dashboard-modal" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h2>{editingId ? `📝 Edit Coupon Code` : '🎟️ Create Premium Coupon Code'}</h2>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-group-dashboard">
                <label>Coupon Code (Alphanumeric uppercase)</label>
                <input 
                  type="text" 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                  placeholder="e.g. MAAPOSHAN20"
                  className="form-control-dashboard"
                  style={{ textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group-dashboard">
                  <label>Discount Type</label>
                  <select 
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="form-control-dashboard"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group-dashboard">
                  <label>{formData.discountType === 'percentage' ? 'Discount Value (%)' : 'Discount Value (₹)'}</label>
                  <input 
                    type="number" 
                    value={formData.discountValue} 
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})} 
                    placeholder={formData.discountType === 'percentage' ? '15' : '150'}
                    className="form-control-dashboard"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-dashboard">
                  <label>Min Cart Subtotal (₹)</label>
                  <input 
                    type="number" 
                    value={formData.minPurchase} 
                    onChange={(e) => setFormData({...formData, minPurchase: e.target.value})} 
                    placeholder="0"
                    className="form-control-dashboard"
                  />
                </div>
                <div className="form-group-dashboard">
                  <label>Max Discount Cap (₹) [Percentage only]</label>
                  <input 
                    type="number" 
                    value={formData.maxDiscount} 
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})} 
                    placeholder="Optional Cap e.g. 500"
                    disabled={formData.discountType === 'fixed'}
                    className="form-control-dashboard"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-dashboard">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={formData.startDate} 
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                    className="form-control-dashboard"
                    required
                  />
                </div>
                <div className="form-group-dashboard">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={formData.endDate} 
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                    className="form-control-dashboard"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-dashboard">
                  <label>Total Usage Limit</label>
                  <input 
                    type="number" 
                    value={formData.usageLimit} 
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})} 
                    placeholder="e.g. 200 (Optional)"
                    className="form-control-dashboard"
                  />
                </div>
                <div className="form-group-dashboard" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      style={{ width: '18px', height: '18px', accentColor: '#6B1D2F' }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Active & Redeemable</span>
                  </label>
                </div>
              </div>

              {/* ── Product Multi-Selection (Target Specific Kit) ── */}
              <div className="nested-section" style={{ backgroundColor: 'rgba(197, 168, 128, 0.05)', border: '1px solid rgba(197,168,128,0.2)' }}>
                <div className="nested-section-title" style={{ color: '#6B1D2F', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  <span>🎯 Restrict to Specific Products (Optional)</span>
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#8C7A7C' }}>
                  If no products are selected, this coupon acts as a **Global Code** applying to all items in the cart.
                </p>

                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '5px' }}>
                  {products.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: '#8C7A7C', fontStyle: 'italic' }}>Loading products...</span>
                  ) : (
                    products.map(prod => {
                      const isSelected = formData.applicableProducts.includes(prod.id);
                      return (
                        <label 
                          key={prod.id} 
                          style={{
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            cursor: 'pointer',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? 'rgba(107, 29, 47, 0.06)' : 'transparent',
                            border: isSelected ? '1px solid rgba(107, 29, 47, 0.2)' : '1px solid transparent',
                            transition: 'all 0.15s'
                          }}
                        >
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleProduct(prod.id)}
                            style={{ accentColor: '#6B1D2F', width: '16px', height: '16px' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#3C2226' }}>{prod.title}</span>
                            <span style={{ fontSize: '0.7rem', color: '#8C7A7C' }}>ID: {prod.id}</span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary-dashboard" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-dashboard">
                  {editingId ? 'Save Coupon Rules' : 'Publish Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        show={confirmModal.show}
        title="Delete Coupon?"
        message={`Are you sure you want to permanently delete coupon code "${confirmModal.coupon?.code || ''}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        onConfirm={executeDelete}
        onCancel={() => setConfirmModal({ show: false, coupon: null })}
      />
    </>
  );
};

export default CouponsManager;
