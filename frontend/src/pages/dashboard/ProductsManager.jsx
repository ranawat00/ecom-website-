import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Sparkles,
  ShoppingBag,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import { useProducts } from '../../context/ProductContext';
import '../../assets/styles/Dashboard.css';

const ProductsManager = () => {
  const { refreshProducts } = useProducts();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ─── Modal Form State ───
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    tag: '',
    description: '',
    imageUrl: '', // mapped to images[0]
    price: '', // simplified input for standard variant
    weight: '', // simplified weight for variant (e.g. '500g', '1kg')
    essenceQuote: '',
    essenceDesc: '',
    benefits: [], // list of { id, icon, text }
    ingredients: [] // list of { name, image }
  });

  // Dynamic input row states
  const [newBenefit, setNewBenefit] = useState({ icon: 'Leaf', text: '' });
  const [newIngredient, setNewIngredient] = useState({ name: '', image: '' });

  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.get('/api/admin/products');
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('[AdminProducts] Fetch failed:', err);
      toast.error('Failed to load product catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      id: '',
      title: '',
      tag: 'Organic',
      description: '',
      imageUrl: '/images/jaggery-block.jpg',
      price: '199',
      weight: '500g',
      essenceQuote: 'Crafted with traditional methods from organic sugarcane fields.',
      essenceDesc: 'MaaPoshan heritage organic jaggery is rich in vitamins, minerals and iron.',
      benefits: [
        { id: 1, icon: 'Shield', text: 'Boosts immune response naturally' },
        { id: 2, icon: 'Heart', text: 'Improves digestion and liver health' }
      ],
      ingredients: [
        { name: 'Sugarcane Juice', image: '/images/sugarcane.jpg' }
      ]
    });
    setModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (product) => {
    setEditingId(product.id);
    
    // Extract base variant weight & price
    let weight = '500g';
    let price = '199';
    if (product.variants && Object.keys(product.variants).length > 0) {
      weight = Object.keys(product.variants)[0];
      price = product.variants[weight]?.price || '199';
    }

    setFormData({
      id: product.id,
      title: product.title,
      tag: product.tag || '',
      description: product.description || '',
      imageUrl: product.images && product.images.length > 0 ? product.images[0] : '',
      price: price.toString(),
      weight: weight,
      essenceQuote: product.details?.essenceQuote || '',
      essenceDesc: product.details?.essenceDesc || '',
      benefits: product.benefits || [],
      ingredients: product.details?.ingredients || []
    });
    setModalOpen(true);
  };

  // Submit Product Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Build actual Product payload to match MongoDB model schema
    const variantsPayload = {};
    variantsPayload[formData.weight || '500g'] = {
      price: parseFloat(formData.price || '199'),
      originalPrice: parseFloat(formData.price || '199') * 1.3, // simulated discount
      inStock: true
    };

    const payload = {
      id: formData.id,
      title: formData.title,
      tag: formData.tag,
      description: formData.description,
      images: [formData.imageUrl || '/images/jaggery-block.jpg'],
      variants: variantsPayload,
      benefits: formData.benefits,
      details: {
        essenceQuote: formData.essenceQuote,
        essenceDesc: formData.essenceDesc,
        ingredients: formData.ingredients,
        nutrition: [
          { label: 'Energy', value: '383 kcal' },
          { label: 'Iron', value: '11.5 mg' },
          { label: 'Calcium', value: '80 mg' }
        ],
        reviewsData: [],
        relatedData: []
      }
    };

    try {
      if (editingId) {
        // Edit API call
        const res = await api.put(`/api/admin/products/${editingId}`, payload);
        if (res.success) {
          toast.success('Product updated successfully!');
          setModalOpen(false);
          fetchProducts();
          refreshProducts(); // Refresh global website products context
        }
      } else {
        // Add API call
        const res = await api.post('/api/admin/products', payload);
        if (res.success) {
          toast.success('Product created successfully!');
          setModalOpen(false);
          fetchProducts();
          refreshProducts(); // Refresh global website products context
        }
      }
    } catch (err) {
      console.error('[AdminProduct] Submit failed:', err);
      const msg = err.response?.data?.message || 'Failed to save product details.';
      toast.error(msg);
    }
  };

  // Delete Product
  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to permanently delete product ID "${id}"?`)) return;
    try {
      const res = await api.delete(`/api/admin/products/${id}`);
      if (res.success) {
        toast.success('Product deleted successfully.');
        fetchProducts();
        refreshProducts(); // Refresh global website products context
      }
    } catch (err) {
      console.error('[AdminProduct] Delete failed:', err);
      toast.error('Failed to delete product.');
    }
  };

  // Add Benefit to local list
  const addBenefitRow = () => {
    if (!newBenefit.text.trim()) return;
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, { id: prev.benefits.length + 1, ...newBenefit }]
    }));
    setNewBenefit({ icon: 'Leaf', text: '' });
  };

  // Remove Benefit from local list
  const removeBenefitRow = (idx) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== idx)
    }));
  };

  // Add Ingredient to local list
  const addIngredientRow = () => {
    if (!newIngredient.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...newIngredient, image: newIngredient.image || '/images/default.jpg' }]
    }));
    setNewIngredient({ name: '', image: '' });
  };

  // Remove Ingredient from local list
  const removeIngredientRow = (idx) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== idx)
    }));
  };

  // Filters
  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(search.toLowerCase()) ||
    product.id.toLowerCase().includes(search.toLowerCase()) ||
    (product.tag && product.tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Product Catalog</h1>
          <p>Create, update, and manage the premium product lineup.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary-dashboard" onClick={handleOpenAdd}>
            <Plus size={18} /> Add New Product
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="dashboard-card">
        {/* Search Row */}
        <div className="filters-row">
          <div className="search-input-wrap">
            <Search />
            <input 
              type="text" 
              placeholder="Search by title, ID or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-dashboard"
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: '#8C7A7C', fontWeight: '600' }}>
            Showing {filteredProducts.length} of {products.length} Products
          </span>
        </div>

        {/* Table list */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Custom ID</th>
                <th>Product Title</th>
                <th>Category Tag</th>
                <th>Price Range</th>
                <th>Active Reviews</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#6B1D2F', fontWeight: '600' }}>
                    Loading catalog list...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#8C7A7C' }}>
                    No products matching search queries.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  let displayPrice = 'N/A';
                  if (product.variants && typeof product.variants === 'object') {
                    const keys = Object.keys(product.variants);
                    if (keys.length > 0) {
                      const prices = keys.map(k => product.variants[k]?.price).filter(Boolean);
                      if (prices.length > 0) {
                        displayPrice = prices.length === 1 ? `₹${prices[0]}` : `₹${Math.min(...prices)} - ₹${Math.max(...prices)}`;
                      }
                    }
                  }
                  return (
                    <tr key={product.id}>
                      <td>
                        <img 
                          src={product.images && product.images.length > 0 ? product.images[0] : '/images/logo.png'} 
                          alt={product.title} 
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(197,168,128,0.2)' }}
                        />
                      </td>
                      <td style={{ fontWeight: '700', color: '#6B1D2F' }}>{product.id}</td>
                      <td style={{ fontWeight: '600' }}>{product.title}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: 'rgba(197, 168, 128, 0.15)', color: '#3C2226', border: '1px solid rgba(197,168,128,0.25)' }}>
                          {product.tag || 'Standard'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700', color: '#6B1D2F' }}>{displayPrice}</td>
                      <td style={{ fontWeight: '600' }}>⭐ {product.reviews || 0} reviews</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-action-edit" title="Edit Product" onClick={() => handleOpenEdit(product)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-action-delete" title="Delete Product" onClick={() => handleDelete(product.id)}>
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

      {/* ── Add/Edit Modal (Slide-Over Drawer) ── */}
      {modalOpen && (
        <div className="dashboard-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="dashboard-modal">
            <div className="modal-header">
              <h2>{editingId ? `📝 Edit Product: ${editingId}` : '🌱 Add New Jaggery Product'}</h2>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              {/* Product Basic info */}
              <div className="form-grid-2">
                <div className="form-group-dashboard">
                  <label>Custom ID (URL Slug)</label>
                  <input 
                    type="text" 
                    value={formData.id} 
                    onChange={(e) => setFormData({...formData, id: e.target.value})} 
                    placeholder="e.g. organic-jaggery-powder"
                    className="form-control-dashboard"
                    disabled={!!editingId}
                    required
                  />
                </div>
                <div className="form-group-dashboard">
                  <label>Product Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    placeholder="e.g. Organic Jaggery Powder"
                    className="form-control-dashboard"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-dashboard">
                  <label>Category Tag</label>
                  <input 
                    type="text" 
                    value={formData.tag} 
                    onChange={(e) => setFormData({...formData, tag: e.target.value})} 
                    placeholder="e.g. Organic, Spiced, Solid"
                    className="form-control-dashboard"
                  />
                </div>
                <div className="form-group-dashboard">
                  <label>Image URL</label>
                  <input 
                    type="text" 
                    value={formData.imageUrl} 
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
                    placeholder="/images/jaggery-block.jpg"
                    className="form-control-dashboard"
                  />
                </div>
              </div>

              {/* Variants base setting */}
              <div className="form-grid-2">
                <div className="form-group-dashboard">
                  <label>Weight (Standard variant)</label>
                  <input 
                    type="text" 
                    value={formData.weight} 
                    onChange={(e) => setFormData({...formData, weight: e.target.value})} 
                    placeholder="e.g. 500g, 1kg"
                    className="form-control-dashboard"
                    required
                  />
                </div>
                <div className="form-group-dashboard">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    placeholder="199"
                    className="form-control-dashboard"
                    required
                  />
                </div>
              </div>

              <div className="form-group-dashboard">
                <label>Description</label>
                <textarea 
                  rows={3}
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Detailed description of premium sugarcane jaggery..."
                  className="form-control-dashboard"
                />
              </div>

              {/* Essence quotes details */}
              <div className="form-group-dashboard">
                <label>Essence Quote</label>
                <input 
                  type="text" 
                  value={formData.essenceQuote} 
                  onChange={(e) => setFormData({...formData, essenceQuote: e.target.value})} 
                  placeholder="Traditional farm-fresh organic sweetener..."
                  className="form-control-dashboard"
                />
              </div>

              <div className="form-group-dashboard">
                <label>Essence Description</label>
                <textarea 
                  rows={2}
                  value={formData.essenceDesc} 
                  onChange={(e) => setFormData({...formData, essenceDesc: e.target.value})} 
                  placeholder="A lengthy detail paragraph discussing traditional extraction methods..."
                  className="form-control-dashboard"
                />
              </div>

              {/* Dynamic Benefits Section */}
              <div className="nested-section">
                <div className="nested-section-title">
                  <span>✨ Benefits list</span>
                  <span style={{ fontSize: '0.75rem', textTransform: 'lowercase' }}>{formData.benefits.length} items</span>
                </div>
                {formData.benefits.map((ben, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '0.85rem' }}>⭐ <strong>[{ben.icon}]</strong> {ben.text}</span>
                    <button type="button" onClick={() => removeBenefitRow(idx)} style={{ color: '#F44336', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                  </div>
                ))}
                <div className="nested-row" style={{ marginTop: '12px' }}>
                  <select 
                    value={newBenefit.icon} 
                    onChange={(e) => setNewBenefit({...newBenefit, icon: e.target.value})}
                    className="form-control-dashboard"
                    style={{ flex: '0 0 110px', padding: '6px' }}
                  >
                    <option value="Leaf">Leaf</option>
                    <option value="Shield">Shield</option>
                    <option value="Heart">Heart</option>
                    <option value="Sparkles">Sparkles</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Enter health benefit description..."
                    value={newBenefit.text}
                    onChange={(e) => setNewBenefit({...newBenefit, text: e.target.value})}
                    className="form-control-dashboard"
                    style={{ padding: '6px' }}
                  />
                  <button type="button" onClick={addBenefitRow} className="btn-secondary-dashboard" style={{ padding: '6px 12px' }}>Add</button>
                </div>
              </div>

              {/* Dynamic Ingredients Section */}
              <div className="nested-section">
                <div className="nested-section-title">
                  <span> sugarcane ingredients</span>
                  <span style={{ fontSize: '0.75rem', textTransform: 'lowercase' }}>{formData.ingredients.length} items</span>
                </div>
                {formData.ingredients.map((ing, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '0.85rem' }}>🌱 {ing.name} <span style={{ color: '#8C7A7C', fontSize: '0.75rem' }}>({ing.image})</span></span>
                    <button type="button" onClick={() => removeIngredientRow(idx)} style={{ color: '#F44336', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                  </div>
                ))}
                <div className="nested-row" style={{ marginTop: '12px' }}>
                  <input 
                    type="text" 
                    placeholder="Ingredient Name..."
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                    className="form-control-dashboard"
                    style={{ padding: '6px' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Image URL..."
                    value={newIngredient.image}
                    onChange={(e) => setNewIngredient({...newIngredient, image: e.target.value})}
                    className="form-control-dashboard"
                    style={{ padding: '6px' }}
                  />
                  <button type="button" onClick={addIngredientRow} className="btn-secondary-dashboard" style={{ padding: '6px 12px' }}>Add</button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary-dashboard" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-dashboard">
                  {editingId ? 'Save Product Catalog' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsManager;
