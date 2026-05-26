import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  HelpCircle,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../assets/styles/Dashboard.css';

const EnquiriesManager = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = useCallback(async () => {
    try {
      const data = await api.get('/api/admin/enquiries');
      if (data.success) {
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error('[AdminEnquiries] Fetch failed:', err);
      toast.error('Failed to load support enquiries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Update enquiry status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/api/admin/enquiries/${id}/status`, { status: newStatus });
      if (res.success) {
        toast.success(`Enquiry marked as: ${newStatus}`);
        
        // Update local state
        setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e));
      }
    } catch (err) {
      console.error('[AdminEnquiries] Status update failed:', err);
      toast.error('Failed to update enquiry status.');
    }
  };

  // Filters
  const filteredEnquiries = enquiries.filter(enq => {
    const matchesSearch = 
      enq.name.toLowerCase().includes(search.toLowerCase()) ||
      enq.email.toLowerCase().includes(search.toLowerCase()) ||
      (enq.subject && enq.subject.toLowerCase().includes(search.toLowerCase())) ||
      enq.message.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || enq.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'Resolved': return 'badge-paid';
      case 'In Progress': return 'badge-cod';
      default: return 'badge-pending';
    }
  };

  // Summary counts
  const pendingCount = enquiries.filter(e => e.status === 'Pending').length;
  const inProgressCount = enquiries.filter(e => e.status === 'In Progress').length;

  return (
    <>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Customer Enquiries Desk</h1>
          <p>Read contact submissions, customer feedback, and update support ticket statuses.</p>
        </div>
      </div>

      {/* Grid of status cards */}
      <div className="stats-grid" style={{ marginBottom: '10px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #F44336' }}>
          <div className="stat-info">
            <p>Pending Tickets</p>
            <h3 style={{ color: '#C62828' }}>{pendingCount} Pending</h3>
            <span className="stat-subtext negative">Needs immediate review</span>
          </div>
          <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(244,67,54,0.1)', color: '#C62828' }}>
            <AlertCircle size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #2196F3' }}>
          <div className="stat-info">
            <p>Active Support</p>
            <h3>{inProgressCount} In Progress</h3>
            <span className="stat-subtext">Currently being handled</span>
          </div>
          <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', color: '#1565C0' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #4CAF50' }}>
          <div className="stat-info">
            <p>Resolved Tickets</p>
            <h3 style={{ color: '#2E7D32' }}>{enquiries.filter(e => e.status === 'Resolved').length} Solved</h3>
            <span className="stat-subtext" style={{ color: '#4CAF50' }}><CheckCircle size={12} /> Support efficiency high</span>
          </div>
          <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#2E7D32' }}>
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Enquiries Grid card */}
      <div className="dashboard-card">
        {/* Search Row */}
        <div className="filters-row">
          <div className="search-input-wrap">
            <Search />
            <input 
              type="text" 
              placeholder="Search by name, email, subject, message text..." 
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
            <option value="All">All Tickets</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Tickets Table */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer Contact</th>
                <th>Subject & Category</th>
                <th>Message Content</th>
                <th>Submitted Date</th>
                <th>Status Tracker</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#6B1D2F', fontWeight: '600' }}>
                    Accessing support databases...
                  </td>
                </tr>
              ) : filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#8C7A7C' }}>
                    No enquiries found matching filters.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{enq.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8C7A7C' }}>{enq.email}</div>
                      {enq.phone && <div style={{ fontSize: '0.8rem', color: '#8C7A7C', fontFamily: 'monospace' }}>+91 {enq.phone}</div>}
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#6B1D2F' }}>{enq.subject || 'General Enquiry'}</div>
                      <span className="badge" style={{ backgroundColor: 'rgba(197, 168, 128, 0.1)', color: '#3C2226', border: '1px solid rgba(197,168,128,0.2)', fontSize: '0.75rem', padding: '3px 8px', marginTop: '4px' }}>
                        Type: {enq.type || 'General'}
                      </span>
                    </td>
                    <td style={{ maxWidth: '350px', whiteSpace: 'normal', lineHeight: '1.4', fontSize: '0.9rem' }}>
                      {enq.message}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#8C7A7C' }}>
                      {new Date(enq.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td>
                      <select 
                        value={enq.status} 
                        onChange={(e) => handleUpdateStatus(enq._id, e.target.value)}
                        className={`badge ${getStatusClass(enq.status)}`}
                        style={{ border: 'none', cursor: 'pointer', outline: 'none', paddingRight: '8px' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
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

export default EnquiriesManager;
