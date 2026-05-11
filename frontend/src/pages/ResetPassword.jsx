import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../api/api';
import { toast } from 'react-toastify';
import '../assets/styles/Profile.css'; // Reusing profile styles for card aesthetic

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Visibility toggles
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match!');
    }
    setLoading(true);
    try {
      const data = await api.post(`/api/auth/reset-password/${token}`, { newPassword: password });
      if (data.success) {
        toast.success('Password reset successfully! Please log in with your new password.');
        navigate('/'); // Redirect to home/login
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-container" style={{ maxWidth: '600px' }}>
       <div className="profile-page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
        <div className="header-titles">
          <h1>Reset Password</h1>
          <p>Please enter your new secure password below</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="card-header">
          <div className="icon-wrapper sec-icon">
            <Lock size={24} />
          </div>
          <div>
            <h2>Set New Password</h2>
            <p>Your new password must be different from previous ones</p>
          </div>
        </div>

        <form className="profile-form-page" onSubmit={handleSubmit}>
          <div className="form-group-full">
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPass ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                minLength={6}
              />
              <button type="button" className="pass-toggle-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="form-group-full">
            <label>Confirm New Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showConfirmPass ? "text" : "password"} 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                minLength={6}
              />
              <button type="button" className="pass-toggle-btn" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="save-password-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>

      <div className="status-card" style={{ marginTop: '32px', borderRadius: '24px' }}>
          <ShieldCheck size={40} className="status-icon" />
          <h3>Safe & Secure</h3>
          <p>We use industry-standard encryption to ensure your new password remains completely private.</p>
      </div>
    </div>
  );
};

export default React.memo(ResetPassword);
