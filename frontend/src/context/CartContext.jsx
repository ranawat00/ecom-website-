import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api/api';
import { Analytics } from '../utils/analytics';

const CartContext = createContext();

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const parsed = parseFloat(price.toString().replace(/[^\d.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isLoggedIn = () => !!localStorage.getItem('token');
  const fetchedRef = React.useRef(false);
  const isFetchingRef = React.useRef(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn()) {
      const storedCart = localStorage.getItem('guestCart');
      if (storedCart) {
        try {
          const items = JSON.parse(storedCart);
          setCartItems(items);
          const total = items.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0);
          setCartTotal(total);
        } catch (e) {
          console.error('Failed to parse guest cart', e);
        }
      } else {
        setCartItems([]);
        setCartTotal(0);
      }
      setIsInitialLoad(false);
      return;
    }
    if (isFetchingRef.current) return;
    
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

  // Restore cart from backend or localStorage whenever app loads or token changes
  useEffect(() => {
    if (isLoggedIn() && !fetchedRef.current) {
      fetchCart();
      fetchedRef.current = true;
    } else if (!isLoggedIn()) {
      fetchCart();
    }

    const onAuthChange = async (e) => {
      const hasToken = !!localStorage.getItem('token');
      
      if (!hasToken) {
        setCartItems([]);
        setCartTotal(0);
        setIsInitialLoad(false);
        fetchedRef.current = false;
      } else {
        // Logged in! Merge guest cart with backend!
        const guestCartStr = localStorage.getItem('guestCart');
        if (guestCartStr) {
          try {
            const guestItems = JSON.parse(guestCartStr);
            if (guestItems && guestItems.length > 0) {
              console.log('[CartContext] Merging guest cart with backend...', guestItems);
              for (const item of guestItems) {
                await api.post('/api/cart', {
                  productId: item.productId,
                  title: item.title,
                  price: parsePrice(item.price),
                  image: item.image,
                  weight: item.weight,
                  quantity: item.quantity
                });
              }
              localStorage.removeItem('guestCart');
            }
          } catch (err) {
            console.error('Failed to merge guest cart', err);
          }
        }
        fetchedRef.current = false;
        fetchCart();
      }
    };
    window.addEventListener('authChange', onAuthChange);
    return () => window.removeEventListener('authChange', onAuthChange);
  }, [fetchCart]);

  const addToCart = useCallback(async (product, showDrawer = true, silent = false) => {
    if (!isLoggedIn()) {
      let storedCart = [];
      const rawCart = localStorage.getItem('guestCart');
      if (rawCart) {
        try {
          storedCart = JSON.parse(rawCart);
        } catch (e) {}
      }
      
      const existingItemIndex = storedCart.findIndex(
        item => item.productId === product.productId && item.weight === product.weight
      );

      if (existingItemIndex > -1) {
        storedCart[existingItemIndex].quantity += (product.quantity || 1);
      } else {
        const guestItem = {
          itemId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId: product.productId,
          title: product.title,
          price: parsePrice(product.price),
          image: product.image,
          weight: product.weight,
          quantity: product.quantity || 1
        };
        storedCart.push(guestItem);
      }

      localStorage.setItem('guestCart', JSON.stringify(storedCart));
      setCartItems(storedCart);
      const total = storedCart.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0);
      setCartTotal(total);

      Analytics.addToCart(product, product.quantity || 1);

      if (!silent) {
        toast.success(`${product.title} added to cart!`);
        if (showDrawer) setIsCartOpen(true);
      }
      return;
    }
    try {
      const data = await api.post('/api/cart', product);
      if (data.success) {
        setCartItems(data.items);
        setCartTotal(data.total);
        Analytics.addToCart(product, product.quantity || 1);

        if (!silent) {
          toast.success(`${product.title} added to cart!`);
          if (showDrawer) setIsCartOpen(true);
        }
      }
    } catch (err) {
      console.error('Add to cart failed', err);
    }
  }, []);

  const updateCartItem = useCallback(async (itemId, quantity) => {
    if (!isLoggedIn()) {
      let storedCart = [];
      const rawCart = localStorage.getItem('guestCart');
      if (rawCart) {
        try {
          storedCart = JSON.parse(rawCart);
        } catch (e) {}
      }
      const itemIndex = storedCart.findIndex(item => item.itemId === itemId);
      if (itemIndex > -1) {
        if (quantity <= 0) {
          storedCart = storedCart.filter(item => item.itemId !== itemId);
        } else {
          storedCart[itemIndex].quantity = quantity;
        }
        localStorage.setItem('guestCart', JSON.stringify(storedCart));
        setCartItems(storedCart);
        const total = storedCart.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0);
        setCartTotal(total);
      }
      return;
    }
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
    if (!isLoggedIn()) {
      let storedCart = [];
      const rawCart = localStorage.getItem('guestCart');
      if (rawCart) {
        try {
          storedCart = JSON.parse(rawCart);
        } catch (e) {}
      }
      const newCart = storedCart.filter(item => item.itemId !== itemId);
      localStorage.setItem('guestCart', JSON.stringify(newCart));
      setCartItems(newCart);
      const total = newCart.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0);
      setCartTotal(total);
      toast.info('Item removed from cart.');
      return;
    }
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
    if (!isLoggedIn()) {
      localStorage.removeItem('guestCart');
      setCartItems([]);
      setCartTotal(0);
      return;
    }
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
