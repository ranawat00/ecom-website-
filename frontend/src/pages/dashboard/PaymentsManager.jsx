import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../assets/styles/Dashboard.css';

const PaymentsManager = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    try {
      const data = await api.get('/api/admin/payments');
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('[AdminPayments] Fetch failed:', err);
      toast.error('Failed to load transaction audit trail.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Filters
  const filteredPayments = payments.filter(pay => {
    const matchesSearch = 
      pay.id.toLowerCase().includes(search.toLowerCase()) ||
      pay.customer.toLowerCase().includes(search.toLowerCase()) ||
      pay.paymentId.toLowerCase().includes(search.toLowerCase());
      
    const matchesMethod = methodFilter === 'All' || pay.paymentMethod === methodFilter;
    
    return matchesSearch && matchesMethod;
  });

  // Calculate totals
  const totalFinancials = filteredPayments.reduce((sum, p) => p.status === 'Paid' ? sum + p.amount : sum, 0);
  const totalCOD = filteredPayments.filter(p => p.paymentMethod === 'COD').reduce((sum, p) => sum + p.amount, 0);
  const totalRazorpay = filteredPayments.filter(p => p.paymentMethod === 'Razorpay').reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Financial Audit Trail</h1>
          <p>Verify payments, Razorpay transactions, and Cash on Delivery orders.</p>
        </div>
      </div>

      {/* Transaction statistics summary row */}
      <div className="stats-grid" style={{ marginBottom: '10px' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #4CAF50' }}>
          <div className="stat-info">
            <p>Settled Revenue</p>
            <h3 style={{ color: '#2E7D32' }}>₹{totalFinancials.toLocaleString('en-IN')}</h3>
            <span className="stat-subtext" style={{ color: '#4CAF50' }}>Successful settlements</span>
          </div>
          <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#2E7D32' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #2196F3' }}>
          <div className="stat-info">
            <p>Razorpay Portal</p>
            <h3>₹{totalRazorpay.toLocaleString('en-IN')}</h3>
            <span className="stat-subtext">Online prepaid flow</span>
          </div>
          <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', color: '#1565C0' }}>
            <CreditCard size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #FF9800' }}>
          <div className="stat-info">
            <p>COD Receivables</p>
            <h3>₹{totalCOD.toLocaleString('en-IN')}</h3>
            <span className="stat-subtext">Pay on delivery</span>
          </div>
          <div className="stat-icon-wrap" style={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', color: '#E65100' }}>
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Payments audit grid card */}
      <div className="dashboard-card">
        {/* Search Row */}
        <div className="filters-row">
          <div className="search-input-wrap">
            <Search />
            <input 
              type="text" 
              placeholder="Search by order ID, transaction reference..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-dashboard"
            />
          </div>

          <select 
            value={methodFilter} 
            onChange={(e) => setMethodFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Payment Methods</option>
            <option value="Razorpay">Razorpay</option>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="UPI">UPI / Bank Transfer</option>
          </select>
        </div>

        {/* Audit Table */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Purchaser</th>
                <th>Payment Date</th>
                <th>Gateway Reference</th>
                <th>Method</th>
                <th>Settlement Status</th>
                <th>Transaction Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#6B1D2F', fontWeight: '600' }}>
                    Loading financial ledgers...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#8C7A7C' }}>
                    No financial logs found matching filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', color: '#6B1D2F' }}>{pay.id}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{pay.customer}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8C7A7C' }}>{pay.email}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#8C7A7C' }}>
                      {new Date(pay.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: pay.paymentId === 'COD_PENDING' ? '#FF9800' : '#3C2226' }}>
                      {pay.paymentId}
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#FAF5EE', border: '1px solid rgba(197, 168, 128, 0.4)', color: '#3C2226' }}>
                        {pay.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        pay.status === 'Paid' ? 'badge-paid' : 
                        pay.status === 'Pending COD' ? 'badge-pending' : 
                        'badge-void'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', color: '#6B1D2F', textAlign: 'right', fontSize: '1rem', paddingRight: '35px' }}>
                      ₹{pay.amount.toFixed(2)}
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

export default PaymentsManager;
