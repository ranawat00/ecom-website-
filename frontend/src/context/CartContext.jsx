import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/api';
import { Analytics } from '../utils/analytics';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isLoggedIn = () => !!localStorage.getItem('token');
  const fetchedRef = React.useRef(false);
  const isFetchingRef = React.useRef(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn() || isFetchingRef.current) {
      if (!isLoggedIn()) setIsInitialLoad(false);
      return;
    }
    
    isFetchingRef.current = true;
    try {
      console.log('[CartContext] Fetching cart...');
      const data = await api.get('/api/cart');
      if (data.success) {
        setCartItems(data.items);
        setCartTotal(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      isFetchingRef.current = false;
      setIsInitialLoad(false);
    }
  }, []);

  // Restore cart from backend whenever app loads or token changes
  useEffect(() => {
    // Initial fetch on mount if already logged in
    if (isLoggedIn() && !fetchedRef.current) {
      fetchCart();
      fetchedRef.current = true;
    } else if (!isLoggedIn()) {
      setIsInitialLoad(false);
    }

    const onAuthChange = (e) => {
      const hasToken = !!localStorage.getItem('token');
      
      if (!hasToken) {
        // Clear cart locally on logout
        setCartItems([]);
        setCartTotal(0);
        setIsInitialLoad(false);
        fetchedRef.current = false;
      }
      // fetchCart() removed from here to prevent auto-calling on login/signup
    };
    window.addEventListener('authChange', onAuthChange);
    return () => window.removeEventListener('authChange', onAuthChange);
  }, [fetchCart]);

  const addToCart = useCallback(async (product, showDrawer = true, silent = false) => {
    if (!isLoggedIn()) {
      toast.error('Please log in to add items to your cart.');
      return;
    }
    try {
      const data = await api.post('/api/cart', product);
      if (data.success) {
        setCartItems(data.items);
        setCartTotal(data.total);
        
        // Track analytics
        Analytics.addToCart(product, product.quantity || 1);

        if (!silent) {
          toast.success(`${product.title} added to cart!`);
          if (showDrawer) setIsCartOpen(true);
        }
      }
    } catch (err) {
      // Errors are handled globally in api.js interceptor or caught here for specific UI needs
      console.error('Add to cart failed', err);
    }
  }, []);

  const updateCartItem = useCallback(async (itemId, quantity) => {
    try {
      const data = await api.put(`/api/cart/${itemId}`, { quantity });
      if (data.success) {
        setCartItems(data.items);
        setCartTotal(data.total);
      }
    } catch (err) {
      console.error('Update cart failed', err);
    }
  }, []);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      const data = await api.delete(`/api/cart/${itemId}`);
      if (data.success) {
        setCartItems(data.items);
        setCartTotal(data.total);
        toast.info('Item removed from cart.');
      }
    } catch (err) {
      console.error('Remove from cart failed', err);
    }
  }, []);

  const clearCart = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      await api.delete('/api/cart');
      setCartItems([]);
      setCartTotal(0);
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  }, []);

  const resetCart = useCallback(() => {
    setCartItems([]);
    setCartTotal(0);
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems, cartTotal, isCartOpen, 
      isInitialLoad, setIsCartOpen, fetchCart,
      addToCart, updateCartItem, removeFromCart, clearCart,
      resetCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
