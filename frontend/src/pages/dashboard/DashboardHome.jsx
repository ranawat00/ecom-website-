import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IndianRupee, 
  ShoppingBag, 
  ClipboardList, 
  HelpCircle, 
  TrendingUp, 
  Users,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../assets/styles/Dashboard.css';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const data = await api.get('/api/admin/stats');
      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setGraphData(data.salesGraph || []);
        if (showToast) toast.success('Dashboard metrics updated!');
      }
    } catch (err) {
      console.error('[DashboardHome] Stats load failed:', err);
      toast.error('Failed to load real-time analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#6B1D2F', fontSize: '1.1rem', fontWeight: '600' }}>
        Loading real-time overview metrics...
      </div>
    );
  }

  // Find max sales for height scaling of simulated CSS bar graph
  const maxSales = graphData.length > 0 ? Math.max(...graphData.map(g => g.sales)) : 10000;

  return (
    <>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Welcome, Administrator</h1>
          <p>Here is your business performance overview for MaaPoshan.</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary-dashboard" 
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin-anim' : ''} />
            {refreshing ? 'Syncing...' : 'Sync Metrics'}
          </button>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <p>Total Revenue</p>
            <h3>₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString('en-IN') : '0'}</h3>
            <span className="stat-subtext"><TrendingUp size={12} /> Live sales audit</span>
          </div>
          <div className="stat-icon-wrap">
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Fulfillment Rate</p>
            <h3>{stats?.fulfillmentRate || '0.0'}%</h3>
            <span className="stat-subtext">{stats?.totalOrders || 0} customer orders</span>
          </div>
          <div className="stat-icon-wrap">
            <ClipboardList size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Active Catalog</p>
            <h3>{stats?.activeProducts || 0}</h3>
            <span className="stat-subtext" style={{ color: '#C5A880' }}>Premium products list</span>
          </div>
          <div className="stat-icon-wrap">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Enquiries Desk</p>
            <h3>{stats?.activeEnquiries || 0}</h3>
            <span className="stat-subtext negative" style={{ color: stats?.activeEnquiries > 0 ? '#F44336' : '#4CAF50' }}>
              {stats?.activeEnquiries > 0 ? 'Action required' : 'All clear'}
            </span>
          </div>
          <div className="stat-icon-wrap">
            <HelpCircle size={24} />
          </div>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px', flexWrap: 'wrap' }} className="form-grid-2">
        {/* Sales Performance Simulated Chart card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Sales Performance Trend</h3>
            <span style={{ fontSize: '0.85rem', color: '#8C7A7C', fontWeight: '600' }}>Last 6 Months (₹)</span>
          </div>
          
          {/* Simulated Premium SVG/CSS chart bar list */}
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '240px', padding: '20px 10px', background: 'rgba(197, 168, 128, 0.03)', borderRadius: '12px', border: '1px solid rgba(197, 168, 128, 0.1)' }}>
            {graphData.map((dataPoint, idx) => {
              const heightPercentage = Math.max(15, (dataPoint.sales / maxSales) * 100);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6B1D2F' }}>₹{dataPoint.sales.toLocaleString('en-IN')}</span>
                  <div style={{
                    width: '32px',
                    height: `${heightPercentage * 1.5}px`,
                    background: 'linear-gradient(180deg, #6B1D2F 0%, #C5A880 100%)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.6s ease',
                    boxShadow: '0 4px 12px rgba(107, 29, 47, 0.15)'
                  }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#8C7A7C' }}>{dataPoint.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Business statistics breakdown details card */}
        <div className="dashboard-card" style={{ justifyContent: 'space-between' }}>
          <div className="card-header">
            <h3>System Status Breakdown</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4CAF50' }} />
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Conversion Rate</span>
              </div>
              <span style={{ fontWeight: '700', fontSize: '1rem', color: '#4CAF50' }}>{stats?.conversionRate || '3.8'}%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF9800' }} />
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Pending Orders</span>
              </div>
              <span style={{ fontWeight: '700', fontSize: '1rem', color: '#FF9800' }}>
                {recentOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2196F3' }} />
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Registered Customers</span>
              </div>
              <span style={{ fontWeight: '700', fontSize: '1rem', color: '#2196F3' }}>{stats?.totalCustomers || 0} users</span>
            </div>
          </div>

          <div style={{ background: 'rgba(197, 168, 128, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(197, 168, 128, 0.15)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={20} color="#C5A880" />
            <div style={{ fontSize: '0.8rem', color: '#8C7A7C', fontWeight: '500' }}>
              <strong style={{ color: '#6B1D2F', display: 'block', fontSize: '0.85rem' }}>Fulfillment Integrity</strong>
              Keep fulfillment rate above 95% for premium merchant rankings.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders table */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3>Recent Fulfillment Activity</h3>
          <button 
            className="btn-secondary-dashboard" 
            style={{ fontSize: '0.8rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => navigate('/admin/orders')}
          >
            Manage All Orders <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Fulfillment State</th>
                <th>Order Total</th>
                <th>Placed Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#8C7A7C', padding: '30px' }}>
                    No recent transactions recorded.
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: '700', color: '#6B1D2F' }}>{order.id}</td>
                    <td style={{ fontWeight: '600' }}>{order.customer}</td>
                    <td>{order.email}</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'Delivered' ? 'badge-paid' : 
                        order.status === 'Cancelled' ? 'badge-danger' : 
                        'badge-pending'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700' }}>₹{order.amount.toFixed(2)}</td>
                    <td style={{ color: '#8C7A7C', fontSize: '0.85rem' }}>
                      {new Date(order.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default DashboardHome;
