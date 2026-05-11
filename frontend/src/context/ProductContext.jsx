import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../api/api';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/api/products');
        if (data.success) {
          setProducts(data.products);
        } else {
          setError(data.message || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('[ProductContext] Fetch error:', err);
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const productMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [products]);

  const value = {
    products,
    productMap,
    loading,
    error,
    refreshProducts: async () => {
      setLoading(true);
      try {
        const data = await api.get('/api/products');
        if (data.success) setProducts(data.products);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
