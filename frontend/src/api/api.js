import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: '', // Using relative path for unified hosting
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
  (response) => {
    // Return only the data part of the response
    return response.data;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      // 401: Unauthorized, 403: Forbidden (Token expired)
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('loginTimestamp');
        
        // Dispatch authChange to notify components (like Navbar)
        window.dispatchEvent(new Event('authChange'));
        
        // Only show message if we were previously logged in or it's a specific auth failure
        if (!window.location.pathname.includes('/auth')) {
          toast.warning('Your session has expired. Please log in again.');
        }
      } else {
        // Handle other errors (500, 400, etc.)
        const message = response.data?.message || 'An unexpected error occurred.';
        console.error('API Error:', message);
      }
    } else {
      console.error('Network Error:', error.message);
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
