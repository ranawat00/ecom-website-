import React, { useState, useEffect } from 'react';
import { User, Mail, Smartphone, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import '../assets/styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobileNo: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Visibility toggles
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (!localStorage.getItem('token')) {
        navigate('/');
      }
    };
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, [navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/api/auth/profile');
        if (data.success) {
          setFormData({
            username: data.user.username || '',
            email: data.user.email || '',
            mobileNo: data.user.mobileNo || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
        toast.error('Failed to load profile. Please log in again.');
        navigate('/');
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.put('/api/auth/profile', formData);
      if (data.success) {
        toast.success('Profile updated successfully!');
        window.dispatchEvent(new Event('authChange'));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match!');
    }
    setPassLoading(true);
    try {
      const data = await api.put('/api/auth/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      if (data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Password update failed.';
      toast.error(msg);
    } finally {
      setPassLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      return toast.error('Please ensure your email is saved in your profile first.');
    }
    toast.info('Sending reset link...');
    try {
      const data = await api.post('/api/auth/forgot-password', { email: formData.email });
      if (data.success) {
        toast.success(
          <div>
            Reset link generated! 
            {data.previewUrl && (
              <a href={data.previewUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '10px', textDecoration: 'underline', color: 'white' }}>
                View Mock Email
              </a>
            )}
          </div>
        );
        if (data.previewUrl) {
          console.log('Reset Link Preview:', data.previewUrl);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link.');
    }
  };

  if (fetching) {
    return (
      <div className="profile-page-loading">
        <div className="loader"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="header-titles">
          <h1>Account Settings</h1>
          <p>Manage your account information and security</p>
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="profile-card profile-info-card">
          <div className="card-header">
            <div className="icon-wrapper">
              <User size={24} />
            </div>
            <div>
              <h2>Personal Information</h2>
              <p>Details used to personalize your experience</p>
            </div>
          </div>

          <form className="profile-form-page" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group-full">
                <label><User size={14} /> Full Name</label>
                <div className="input-with-icon">
                  <input 
                    type="text" 
                    value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                    required 
                    placeholder="Your Name"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-full">
                <label><Mail size={14} /> Email Address</label>
                <div className="input-with-icon">
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    required 
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group-full">
                <label><Smartphone size={14} /> Mobile Number</label>
                <div className="input-with-icon">
                  <input 
                    type="tel" 
                    value={formData.mobileNo} 
                    onChange={e => setFormData({...formData, mobileNo: e.target.value})} 
                    required 
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions-profile">
              <button type="submit" className="save-profile-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="profile-sidebar-cards">
          <div className="profile-card security-card">
            <div className="card-header">
              <div className="icon-wrapper sec-icon">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2>Change Password</h2>
                <p>Ensure your account is using a strong password</p>
              </div>
            </div>

            <form className="profile-form-page" onSubmit={handlePasswordSubmit}>
              <div className="form-group-full">
                <label>Old Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showOldPass ? "text" : "password"} 
                    value={passwordData.oldPassword} 
                    onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} 
                    required 
                    placeholder="••••••••"
                  />
                  <button type="button" className="pass-toggle-btn" onClick={() => setShowOldPass(!showOldPass)}>
                    {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group-full">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showNewPass ? "text" : "password"} 
                    value={passwordData.newPassword} 
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                    required 
                    placeholder="••••••••"
                  />
                  <button type="button" className="pass-toggle-btn" onClick={() => setShowNewPass(!showNewPass)}>
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group-full">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showConfirmPass ? "text" : "password"} 
                    value={passwordData.confirmPassword} 
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                    required 
                    placeholder="••••••••"
                  />
                  <button type="button" className="pass-toggle-btn" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="forgot-password-link">
                <button type="button" onClick={handleForgotPassword}>Forgot Password?</button>
              </div>

              <button type="submit" className="save-password-btn" disabled={passLoading}>
                {passLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
          
          <div className="profile-card help-card">
            <h3>Need Help?</h3>
            <p>Have questions about your account data? Contact our heritage support team.</p>
            <button className="contact-support-btn" onClick={() => navigate('/contact')}>Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Profile);
