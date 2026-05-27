import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Minus, CheckCircle, ShoppingBag, Banknote, CreditCard, Lock, ShieldCheck, Truck, ArrowLeft, ChevronRight, Tag, AlertCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import api from '../api/api';
import { Analytics } from '../utils/analytics';
import AddressModal from '../components/common/AddressModal';
import '../assets/styles/Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, isInitialLoad, setIsCartOpen, fetchCart, resetCart, updateCartItem } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' (Razorpay/UPI) or 'cod'
  const [selectedUPIApp, setSelectedUPIApp] = useState(null); // 'google_pay', 'phone_pe', 'paytm'
  const [isAddressesLoaded, setIsAddressesLoaded] = useState(false);

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Automatically re-validate coupon if cart items or total change in summary sidebar
  useEffect(() => {
    if (appliedCoupon) {
      const revalidateCoupon = async () => {
        try {
          const res = await api.post('/api/coupons/validate', {
            code: appliedCoupon.code,
            cartItems: cartItems.map(item => ({
              productId: item.productId,
              price: item.price,
              quantity: item.quantity
            })),
            cartTotal: cartTotal
          });

          if (res.success) {
            setAppliedCoupon(res);
          } else {
            setAppliedCoupon(null);
            setCouponInput('');
            toast.warn(`Coupon removed: ${res.message || 'cart conditions no longer met.'}`);
          }
        } catch (err) {
          setAppliedCoupon(null);
          setCouponInput('');
        }
      };
      revalidateCoupon();
    }
  }, [cartItems, cartTotal]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.post('/api/coupons/validate', {
        code: couponInput.trim(),
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          price: item.price,
          quantity: item.quantity
        })),
        cartTotal: cartTotal
      });

      if (res.success) {
        setAppliedCoupon(res);
        toast.success(`🎉 Coupon code "${res.code}" applied! Saved ₹${res.discountAmount}`);
      } else {
        setCouponError(res.message || 'Invalid coupon code.');
      }
    } catch (err) {
      console.error('[CheckoutCoupon] Validation failed:', err);
      setCouponError(err?.response?.data?.message || 'Invalid coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    toast.info('Coupon code removed.');
  };
  const fetchedRef = React.useRef(false);

  useEffect(() => {
    if (isInitialLoad || isAddressesLoaded || fetchedRef.current) return;
    
    // Record checkout start
    if (cartItems.length > 0) {
      Analytics.checkoutStart(cartTotal);
    }

    if (!localStorage.getItem('token')) {
      toast.info('Please log in to proceed to checkout.');
      sessionStorage.setItem('redirectAfterLogin', '/checkout');
      window.dispatchEvent(new Event('openAuthModal'));
      navigate('/');
      return;
    }
    
    if (cartItems.length === 0 && !loading) {
       toast.info('Your cart is empty.');
       navigate('/');
       return;
    }

    const fetchInitialData = async () => {
      fetchedRef.current = true;
      try {
        const data = await api.get('/api/address');
        if (data.success) {
          setAddresses(data.addresses);
          if (data.addresses.length > 0) setSelectedAddressId(data.addresses[0].id);
        }
      } catch (err) {
        console.error('Failed to load addresses', err);
        fetchedRef.current = false;
      } finally {
        setLoading(false);
        setIsAddressesLoaded(true);
      }
    };

    fetchInitialData();
  }, [isInitialLoad, isAddressesLoaded, cartItems.length, navigate, loading]);



  const handleAddressModalSave = async (action, formData) => {
    try {
      let data;
      if (action === 'add') {
        data = await api.post('/api/address', formData);
      } else {
        data = await api.put(`/api/address/${formData.id}`, formData);
      }
      
      if (data.success) {
        toast.success(data.message);
        if (action === 'add') {
          setAddresses(prev => [...prev, data.address]);
          setSelectedAddressId(data.address.id);
        } else {
          setAddresses(prev => prev.map(a => a.id === formData.id ? data.address : a));
        }
        setIsAddressModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save address', err);
    }
  };

  const handleProceedWithApp = (app) => {
    handleProceed(app);
  };

  // Dynamically load the Razorpay script and call back when ready
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceed = async (overrideApp) => {
    const finalApp = typeof overrideApp === 'string' ? overrideApp : selectedUPIApp;

    if (!selectedAddressId) {
      toast.error('Please select a delivery address.');
      return;
    }

    // --- COD Flow: no Razorpay needed ---
    if (paymentMethod === 'cod') {
      try {
        setLoading(true);
        const data = await api.post('/api/payment/cod', { 
          addressId: selectedAddressId,
          couponCode: appliedCoupon?.code || null
        });
        if (data.success) {
          resetCart();
          navigate('/order-success', { state: { order: data.order } });
        } else {
          toast.error(data.message || 'Failed to place COD order.');
          setLoading(false);
        }
      } catch (err) {
        console.error('COD placement failed', err);
        toast.error(`COD Error: ${err?.response?.data?.message || err.message}`);
        setLoading(false);
      }
      return;
    }

    // --- Online / Razorpay Flow: load script NOW (lazy) ---
    setLoading(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error('Payment SDK failed to load. Check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      const data = await api.post('/api/payment/create-order', {
        couponCode: appliedCoupon?.code || null
      });
      if (!data.success) {
        toast.error('Failed to initiate payment. Please try again.');
        setLoading(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'MaaPoshan',
        description: 'Premium Postpartum Care Kit Purchase',
        order_id: data.orderId,
        theme: { color: '#6B1D2F' },
        prefill: {
          ...(finalApp === 'google_pay' && { method: 'upi', 'upi.app': 'google_pay' }),
          ...(finalApp === 'phone_pe' && { method: 'upi', 'upi.app': 'phone_pe' }),
          ...(finalApp === 'paytm' && { method: 'upi', 'upi.app': 'paytm' })
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled. Your cart is preserved.');
            setLoading(false);
          }
        },
        handler: async (response) => {
          try {
            const vData = await api.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              addressId: selectedAddressId,
              couponCode: appliedCoupon?.code || null
            });
            if (vData.success) {
              resetCart();
              navigate('/order-success', { state: { order: vData.order } });
            }
          } catch (err) {
            console.error('Payment verification failed', err);
            toast.error('Payment verification failed. Please contact support.');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (err) => {
        toast.error(`Payment failed: ${err.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Razorpay flow failed', err);
      toast.error('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const deliveryFee = cartTotal > 500 ? 0 : 49;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount + deliveryFee);

  if (loading) {
    return (
      <div className="checkout-loading-screen">
        <div className="loading-spinner"></div>
        <p>Preparing your secure checkout experience...</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        
        {/* Top Header & Breadcrumb */}
        <div className="checkout-header-section">
          <button className="back-to-shop-btn" onClick={() => navigate('/products')}>
            <ArrowLeft size={16} /> Back to Shop
          </button>
          <div className="checkout-title-wrapper">
            <h1 className="checkout-title">Checkout</h1>
            <div className="secure-badge-pills">
              <span className="secure-badge"><Lock size={12} /> 256-Bit SSL Encryption</span>
              <span className="secure-badge"><ShieldCheck size={12} /> 100% Safe Payments</span>
            </div>
          </div>
        </div>

        {/* Stepper progress indicator */}
        <div className="checkout-stepper">
          <div className={`step-item completed`}>
            <div className="step-icon-wrapper">
              <ShoppingBag size={18} />
            </div>
            <div className="step-text">
              <span className="step-status">Step 1</span>
              <span className="step-title">Review Cart</span>
            </div>
          </div>
          <div className="step-divider-line completed"></div>
          <div className={`step-item ${selectedAddressId ? 'completed' : 'active'}`}>
            <div className="step-icon-wrapper">
              <MapPin size={18} />
            </div>
            <div className="step-text">
              <span className="step-status">Step 2</span>
              <span className="step-title">Shipping Address</span>
            </div>
          </div>
          <div className="step-divider-line"></div>
          <div className={`step-item ${selectedAddressId ? 'active' : 'upcoming'}`}>
            <div className="step-icon-wrapper">
              <CreditCard size={18} />
            </div>
            <div className="step-text">
              <span className="step-status">Step 3</span>
              <span className="step-title">Secure Payment</span>
            </div>
          </div>
        </div>

        <div className="checkout-grid">
          
          {/* Left Column: Address and Payment */}
          <div className="checkout-left">
            
            {/* Step 1: Delivery Address */}
            <div className={`checkout-section address-section-card ${selectedAddressId ? 'address-selected' : ''}`}>
              <div className="section-header">
                <span className="section-number">1</span>
                <h2>Delivery Address</h2>
              </div>
              
              {addresses.length === 0 ? (
                <div className="no-address-card">
                  <div className="no-address-icon">
                    <MapPin size={32} />
                  </div>
                  <p>No saved addresses found. Add a delivery address to complete your order.</p>
                  <button className="add-address-btn-primary" onClick={() => setIsAddressModalOpen(true)}>
                    <Plus size={16} /> Add Delivery Address
                  </button>
                </div>
              ) : (
                <>
                  <div className="address-grid-options">
                    {addresses.map(addr => (
                      <label key={addr.id} className={`address-card-option ${selectedAddressId === addr.id ? 'active' : ''}`}>
                        <div className="address-card-header">
                          <input
                            type="radio"
                            name="address"
                            value={addr.id}
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="address-radio-input"
                          />
                          <span className={`address-badge-type ${addr.type.toLowerCase()}`}>{addr.type}</span>
                          {selectedAddressId === addr.id && (
                            <span className="verified-check">
                              <CheckCircle size={16} /> Selected
                            </span>
                          )}
                        </div>
                        <div className="address-card-body">
                          <p className="address-street">{addr.street}</p>
                          <p className="address-city-state">{addr.city}, {addr.state}</p>
                          <p className="address-zip">{addr.pincode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  <button className="add-address-btn-dashed" onClick={() => setIsAddressModalOpen(true)}>
                    <Plus size={16} /> Add a New Shipping Address
                  </button>
                </>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className={`checkout-section payment-section-card ${!selectedAddressId ? 'section-disabled' : ''}`}>
              <div className="section-header">
                <span className="section-number">2</span>
                <h2>Payment Method</h2>
                {!selectedAddressId && <span className="locked-badge"><Lock size={12} /> Select address to unlock</span>}
              </div>
              
              <div className="payment-options-list">
                
                {/* Razorpay Online Option */}
                <label className={`payment-method-card ${paymentMethod === 'online' ? 'active' : ''} ${!selectedAddressId ? 'disabled' : ''}`}>
                  <div className="payment-method-header">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      disabled={!selectedAddressId}
                      onChange={() => setPaymentMethod('online')}
                      className="payment-radio-input"
                    />
                    <div className="payment-title-group">
                      <span className="payment-label-title">Online Payment / UPI / Cards</span>
                      <span className="payment-offer-badge">⚡ Instant Verification</span>
                    </div>
                  </div>
                  
                  <div className="payment-method-body">
                    <p className="payment-desc">Pay securely using Google Pay, PhonePe, Paytm, Net Banking, or Credit/Debit Cards via Razorpay.</p>
                    
                    {paymentMethod === 'online' && selectedAddressId && (
                      <div className="upi-apps-selector-panel">
                        <span className="upi-selector-title">Express UPI Checkout:</span>
                        <div className="upi-apps-row">
                          <div 
                            className={`upi-app-button ${selectedUPIApp === 'google_pay' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedUPIApp('google_pay');
                              setTimeout(() => handleProceedWithApp('google_pay'), 100);
                            }}
                          >
                            <img src="https://img.icons8.com/color/48/000000/google-pay.png" alt="Google Pay" />
                            <span>GPay</span>
                          </div>
                          
                          <div 
                            className={`upi-app-button ${selectedUPIApp === 'phone_pe' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedUPIApp('phone_pe');
                              setTimeout(() => handleProceedWithApp('phone_pe'), 100);
                            }}
                          >
                            <img src="https://img.icons8.com/color/48/000000/phone-pe.png" alt="PhonePe" />
                            <span>PhonePe</span>
                          </div>
                          
                          <div 
                            className={`upi-app-button ${selectedUPIApp === 'paytm' ? 'active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedUPIApp('paytm');
                              setTimeout(() => handleProceedWithApp('paytm'), 100);
                            }}
                          >
                            <img src="https://img.icons8.com/color/48/000000/paytm.png" alt="Paytm" />
                            <span>Paytm</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label className={`payment-method-card ${paymentMethod === 'cod' ? 'active' : ''} ${!selectedAddressId ? 'disabled' : ''}`}>
                  <div className="payment-method-header">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      disabled={!selectedAddressId}
                      onChange={() => setPaymentMethod('cod')}
                      className="payment-radio-input"
                    />
                    <div className="payment-title-group">
                      <span className="payment-label-title">Cash on Delivery (COD)</span>
                    </div>
                  </div>
                  <div className="payment-method-body">
                    <div className="cod-info-wrapper">
                      <Banknote size={16} className="cod-icon" />
                      <p className="payment-desc">Pay in cash or UPI QR scan when your package is delivered to your doorstep.</p>
                    </div>
                  </div>
                </label>
                
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="checkout-right">
            <div className="order-summary-sidebar">
              <div className="order-summary-header">
                <h2>Order Summary</h2>
                <span className="items-count-pill">{cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} Items</span>
              </div>
              
              <div className="summary-items-scroll">
                {cartItems.map(item => (
                  <div key={item.itemId} className="summary-item-tile">
                    <div className="summary-item-media">
                      <img src={item.image || '/images/desi-gud-main.png'} alt={item.title} />
                    </div>
                    <div className="summary-item-details">
                      <span className="summary-item-name">{item.title}</span>
                      {item.weight && <span className="summary-item-variant">{item.weight}</span>}
                      
                      <div className="summary-qty-pricing">
                        <div className="checkout-qty-widget">
                          <button 
                            className="qty-btn"
                            onClick={() => updateCartItem(item.itemId, item.quantity - 1)} 
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button 
                            className="qty-btn"
                            onClick={() => updateCartItem(item.itemId, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <div className="item-price-column">
                          <span className="item-unit-rate">₹{item.price} each</span>
                          <span className="item-total-rate">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="checkout-coupon-section">
                <h4 className="coupon-section-title">
                  <Tag size={14} className="coupon-title-icon" /> Have a Promo/Coupon?
                </h4>
                
                {appliedCoupon ? (
                  <div className="applied-coupon-success">
                    <div className="coupon-success-info">
                      <span className="coupon-success-check">✓</span>
                      <div>
                        <span className="coupon-success-code">{appliedCoupon.code}</span>
                        <span className="coupon-success-msg">applied!</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleRemoveCoupon} 
                      className="coupon-remove-btn"
                      title="Remove Coupon"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="coupon-input-group">
                    <input 
                      type="text" 
                      placeholder="Enter Coupon (e.g. WELCOME10)" 
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      className={`coupon-text-input ${couponError ? 'has-error' : ''}`}
                    />
                    <button 
                      type="button" 
                      onClick={handleApplyCoupon} 
                      disabled={couponLoading || !couponInput.trim()}
                      className="coupon-apply-btn"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="coupon-error-text">
                    <AlertCircle size={12} className="coupon-err-icon" /> {couponError}
                  </p>
                )}
              </div>

              {/* Price Calculations */}
              <div className="summary-financials">
                <div className="financial-row">
                  <span className="financial-label">Subtotal</span>
                  <span className="financial-value">₹{cartTotal.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="financial-row discount-row">
                    <span className="financial-label">Coupon Discount ({appliedCoupon.code})</span>
                    <span className="financial-value coupon-savings">-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="financial-row">
                  <span className="financial-label">Shipping & Delivery</span>
                  <span className={`financial-value ${deliveryFee === 0 ? 'free' : ''}`}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                
                {deliveryFee === 0 ? (
                  <div className="delivery-qualifier-banner">
                    <span className="qualifier-icon">🎉</span>
                    <span className="qualifier-text">You qualify for Free Premium Delivery!</span>
                  </div>
                ) : (
                  <div className="delivery-progress-banner">
                    <span>Add <b>₹{(500 - cartTotal).toFixed(0)}</b> more to unlock <b>FREE Delivery</b>!</span>
                  </div>
                )}
                
                <div className="financial-row grand-total-row">
                  <span className="total-label">Total Amount</span>
                  <span className="total-value">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <button 
                className="checkout-primary-action-btn" 
                onClick={handleProceed} 
                disabled={loading || !selectedAddressId}
              >
                {loading ? (
                  <span className="btn-spinner-group">
                    <span className="btn-spinner"></span> Processing...
                  </span>
                ) : (
                  <>
                    <Lock size={16} /> 
                    {paymentMethod === 'cod' ? 'Place COD Order' : 'Proceed to Secure Payment'}
                  </>
                )}
              </button>
              
              {!selectedAddressId && (
                <p className="checkout-action-hint">⚠️ Please select a shipping address to place your order.</p>
              )}

              {/* Trust Badges Panel */}
              <div className="checkout-trust-panel">
                <div className="trust-item">
                  <Truck size={16} />
                  <div>
                    <h4>Fast & Insured Delivery</h4>
                    <p>Dispatched in 24 hours with premium tracking.</p>
                  </div>
                </div>
                <div className="trust-item">
                  <ShieldCheck size={16} />
                  <div>
                    <h4>100% Quality Guaranteed</h4>
                    <p>Authentic products directly from source.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        initialData={null}
        onSave={handleAddressModalSave}
      />
    </div>
  );
};

export default Checkout;
