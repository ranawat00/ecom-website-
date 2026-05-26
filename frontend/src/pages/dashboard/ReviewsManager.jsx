import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Trash2, 
  Star,
  MessageSquare,
  Sparkles,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../assets/styles/Dashboard.css';

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [starsFilter, setStarsFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const data = await api.get('/api/admin/reviews');
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('[AdminReviews] Fetch failed:', err);
      toast.error('Failed to load product reviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Delete review
  const handleDeleteReview = async (productId, reviewId) => {
    if (!window.confirm("Are you sure you want to permanently delete this customer review?")) return;
    
    // The reviewId format is: `${productId}-${index}`
    const parts = reviewId.split('-');
    const index = parts[parts.length - 1]; // last item is the index

    try {
      const res = await api.delete(`/api/admin/reviews/${productId}/${index}`);
      if (res.success) {
        toast.success('Customer review moderated and deleted.');
        
        // Remove locally to avoid reload
        setReviews(prev => prev.filter(r => r.reviewId !== reviewId));
      }
    } catch (err) {
      console.error('[AdminReviews] Delete failed:', err);
      toast.error('Failed to delete review.');
    }
  };

  // Publish/Approve review
  const handlePublishReview = async (productId, reviewId) => {
    // The reviewId format is: `${productId}-${index}`
    const parts = reviewId.split('-');
    const index = parts[parts.length - 1]; // last item is the index

    try {
      const res = await api.put(`/api/admin/reviews/${productId}/${index}/publish`);
      if (res.success) {
        toast.success('Customer review approved and published!');
        
        // Update status locally to avoid reload
        setReviews(prev => prev.map(r => r.reviewId === reviewId ? { ...r, published: true } : r));
      }
    } catch (err) {
      console.error('[AdminReviews] Publish failed:', err);
      toast.error('Failed to publish review.');
    }
  };

  // Filters
  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = 
      rev.name.toLowerCase().includes(search.toLowerCase()) ||
      rev.quote.toLowerCase().includes(search.toLowerCase()) ||
      rev.productTitle.toLowerCase().includes(search.toLowerCase());
      
    const matchesStars = starsFilter === 'All' || rev.stars.toString() === starsFilter;
    
    return matchesSearch && matchesStars;
  });

  // Math summary
  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Reviews Moderation</h1>
          <p>Read customer feedback, analyze product satisfaction, and moderate low-quality submissions.</p>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="stats-grid" style={{ marginBottom: '10px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #C5A880' }}>
          <div className="stat-info">
            <p>Average Satisfaction</p>
            <h3 style={{ color: 'var(--primary-color)' }}>⭐ {averageRating} / 5.0</h3>
            <span className="stat-subtext">Overall rating index</span>
          </div>
          <div className="stat-icon-wrap" style={{ color: 'var(--primary-color)' }}>
            <Sparkles size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #4CAF50' }}>
          <div className="stat-info">
            <p>Total Reviews</p>
            <h3>{reviews.length} Submissions</h3>
            <span className="stat-subtext" style={{ color: '#4CAF50' }}>100% verified buyers</span>
          </div>
          <div className="stat-icon-wrap" style={{ color: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.1)' }}>
            <MessageSquare size={24} />
          </div>
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
              placeholder="Search by customer, quote text or jaggery name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-dashboard"
            />
          </div>

          <select 
            value={starsFilter} 
            onChange={(e) => setStarsFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Stars</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 stars)</option>
            <option value="3">⭐⭐⭐ (3 stars)</option>
            <option value="2">⭐⭐ (2 stars)</option>
            <option value="1">⭐ (1 star)</option>
          </select>
        </div>

        {/* Reviews Grid */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Star Rating</th>
                <th>Product Comment / Review Quote</th>
                <th>Product Reviewed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6B1D2F', fontWeight: '600' }}>
                    Gathering customer feedback...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#8C7A7C' }}>
                    No reviews logged matching criteria.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => (
                  <tr key={rev.reviewId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(107, 29, 47, 0.08)',
                          color: 'var(--primary-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.9rem'
                        }}>
                          {rev.initial}
                        </div>
                        <span style={{ fontWeight: '600' }}>{rev.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#FFB300', fontWeight: '700', fontSize: '0.95rem' }}>
                        {'★'.repeat(rev.stars)}{'☆'.repeat(5 - rev.stars)}
                      </span>
                    </td>
                    <td style={{ fontStyle: 'italic', maxWidth: '350px', whiteSpace: 'normal', lineHeight: '1.4' }}>
                      "{rev.quote}"
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#6B1D2F' }}>{rev.productTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8C7A7C' }}>ID: {rev.productId}</div>
                    </td>
                    <td>
                      {rev.published ? (
                        <span className="badge badge-paid">Published</span>
                      ) : (
                        <span className="badge badge-pending">Pending Approval</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        {!rev.published && (
                          <button 
                            className="btn-action-edit" 
                            title="Approve & Publish Review"
                            onClick={() => handlePublishReview(rev.productId, rev.reviewId)}
                            style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#2E7D32', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button 
                          className="btn-action-delete" 
                          title="Delete/Moderate Review"
                          onClick={() => handleDeleteReview(rev.productId, rev.reviewId)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ReviewsManager;
