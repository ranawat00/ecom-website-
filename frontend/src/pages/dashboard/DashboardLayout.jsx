import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  CreditCard, 
  Star, 
  HelpCircle, 
  LogOut, 
  Home,
  UserCheck,
  Tag
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../assets/styles/Dashboard.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminProfile = useCallback(async () => {
    try {
      const data = await api.get('/api/auth/profile');
      if (data.success && data.user) {
        if (data.user.role === 'admin') {
          setAdminUser(data.user);
        } else {
          toast.error('Access denied. Administrator privileges required.');
          navigate('/');
        }
      } else {
        toast.error('Please log in as an Admin.');
        navigate('/');
      }
    } catch (err) {
      console.error('[DashboardAuth] Auth check failed:', err);
      toast.error('Session expired or unauthorized. Please log in.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required.');
      navigate('/');
    } else {
      fetchAdminProfile();
    }
  }, [navigate, fetchAdminProfile]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Logout warning', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('loginTimestamp');
      toast.info('Logged out from admin console.');
      window.dispatchEvent(new Event('authChange'));
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDFBF7',
        color: '#6B1D2F',
        fontWeight: 'bold',
        fontSize: '1.2rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #C5A880',
            borderTopColor: '#6B1D2F',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span>Verifying Admin credentials...</span>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* ── Sidebar ── */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <Link to="/" className="sidebar-logo">
            <img src="/images/logo.png" alt="MaaPoshan Logo" />
            <span>MaaPoshan Admin</span>
          </Link>
        </div>

        <div 
          className="sidebar-user" 
          onClick={() => navigate('/admin/profile')} 
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          title="View Admin Profile"
        >
          <div className="sidebar-user-avatar">
            {adminUser ? adminUser.username[0].toUpperCase() : 'A'}
          </div>
          <div className="sidebar-user-info">
            <h4>{adminUser ? adminUser.username : 'Administrator'}</h4>
            <span><UserCheck size={10} style={{ marginRight: '3px' }} /> Super Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag />
            <span>Products</span>
          </NavLink>

          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <ClipboardList />
            <span>Orders</span>
          </NavLink>

          <NavLink 
            to="/admin/payments" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <CreditCard />
            <span>Payments</span>
          </NavLink>

          <NavLink 
            to="/admin/reviews" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Star />
            <span>Reviews</span>
          </NavLink>

          <NavLink 
            to="/admin/enquiries" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <HelpCircle />
            <span>Enquiries</span>
          </NavLink>

          <NavLink 
            to="/admin/coupons" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Tag />
            <span>Coupons</span>
          </NavLink>

          <NavLink 
            to="/admin/profile" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <UserCheck />
            <span>Profile Details</span>
          </NavLink>
          
          <Link 
            to="/" 
            className="sidebar-link"
            style={{ marginTop: 'auto', borderTop: '1px solid rgba(250, 245, 238, 0.05)', paddingTop: '15px' }}
          >
            <Home />
            <span>Customer Portal</span>
          </Link>
        </nav>

        <div className="sidebar-footer-btn">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* ── Main Panel Content ── */}
      <main className="dashboard-main">
        <Outlet context={{ adminUser }} />
      </main>
    </div>
  );
};

export default DashboardLayout;
