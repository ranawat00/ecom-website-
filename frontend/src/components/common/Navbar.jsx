import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Moon, Sun, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/api';
import AuthModal from './AuthModal';
import UserSidebar from './UserSidebar';
import CartDrawer from './CartDrawer';
import GlobalSearch from './GlobalSearch';
import { useCart } from '../../context/CartContext';
import '../../assets/styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, isCartOpen, setIsCartOpen } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initial theme setup
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    const checkSessionAge = () => {
      const loginTime = localStorage.getItem('loginTimestamp');
      const token = localStorage.getItem('token');
      if (token && loginTime) {
        const ageInMs = Date.now() - parseInt(loginTime, 10);
        const fortyEightHoursInMs = 48 * 60 * 60 * 1000;

        if (ageInMs > fortyEightHoursInMs) {
          localStorage.removeItem('token');
          localStorage.removeItem('loginTimestamp');
          toast.warning('Your session has expired. Please log in again.');
          window.dispatchEvent(new Event('authChange'));
        }
      }
    };

    const checkAuthStatus = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    checkSessionAge();
    window.addEventListener('authChange', checkAuthStatus);
    return () => window.removeEventListener('authChange', checkAuthStatus);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      toast.success('Dark Theme enabled');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
      toast.info('Light Theme enabled');
    }
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      setIsSidebarOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleNavigate = useCallback((path, hash) => {
    setIsOpen(false);
    if (location.pathname !== path) {
      // If we are on a different page (e.g. /product/123), navigate to Home + hash
      navigate(path + hash);
    } else {
      // If we are already on Home, natively smooth scroll to the section
      if (hash) {
        const id = hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location.pathname, navigate]);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" style={{ textDecoration: 'none' }} onClick={() => handleNavigate('/', '')}>
            <img src="/images/logo.png" alt="MaaPoshan Logo" />
          </Link>

          <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
            <span className="navbar-item" style={{ cursor: 'pointer' }} onClick={() => handleNavigate('/', '')}>Home</span>
            <span className="navbar-item" style={{ cursor: 'pointer' }} onClick={() => handleNavigate('/about', '')}>About Us</span>
            <span className="navbar-item" style={{ cursor: 'pointer' }} onClick={() => handleNavigate('/products', '')}>Products</span>
            <span className="navbar-item" style={{ cursor: 'pointer' }} onClick={() => handleNavigate('/contact', '')}>Contact Us</span>
          </div>

          <div className="navbar-actions">
            <button className="theme-toggle-nav" onClick={() => setIsSearchOpen(true)} title="Search">
              <Search size={22} className="account-icon" />
            </button>
            <button className="theme-toggle-nav" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light' : 'Switch to Dark'}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="navbar-account" title="Account" onClick={handleAccountClick} style={{ cursor: 'pointer' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="account-icon"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>

            <div className="navbar-cart" title="Cart" onClick={() => setIsCartOpen(true)} style={{ cursor: 'pointer', position: 'relative' }}>
              <ShoppingBag size={24} className="account-icon" />
              {cartItems.length > 0 && (
                <span className="cart-badge">{cartItems.reduce((sum, i) => sum + i.quantity, 0)}</span>
              )}
            </div>

            <div className="hamburger" onClick={toggleMenu}>
              <span className={`bar ${isOpen ? 'open' : ''}`}></span>
              <span className={`bar ${isOpen ? 'open' : ''}`}></span>
              <span className={`bar ${isOpen ? 'open' : ''}`}></span>
            </div>
          </div>
        </div>
      </nav>
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <CartDrawer />
    </>
  );
};

export default React.memo(Navbar);
