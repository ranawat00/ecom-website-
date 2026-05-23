import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Minus, CheckCircle, ShoppingBag, Banknote, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import api from '../api/api';
import { Analytics } from '../utils/analytics';
import AddressModal from '../components/common/AddressModal';
import '../assets/styles/Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, isInitialLoad, setIsCartOpen, fetchCart, resetCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' (Razorpay/UPI) or 'cod'
  const [selectedUPIApp, setSelectedUPIApp] = useState(null); // 'google_pay', 'phone_pe', 'paytm'
  const [isAddressesLoaded, setIsAddressesLoaded] = useState(false);
  const fetchedRef = React.useRef(false);

  useEffect(() => {
    if (isInitialLoad || isAddressesLoaded || fetchedRef.current) return;
    
    // Record checkout start
    if (cartItems.length > 0) {
      Analytics.checkoutStart(cartTotal);
    }

    if (!localStorage.getItem('token')) {
      toast.error('Please login to checkout.');
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
        const data = await api.post('/api/payment/cod', { addressId: selectedAddressId });
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
      const data = await api.post('/api/payment/create-order');
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
              addressId: selectedAddressId
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
  const finalTotal = cartTotal + deliveryFee;

  if (loading) return <div className="checkout-loading">Loading...</div>;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-grid">
          {/* Left: Address Selection */}
          <div className="checkout-left">
            <div className="checkout-section">
              <h2><MapPin size={20} /> Delivery Address</h2>
              {addresses.length === 0 ? (
                <div className="no-address">
                  <p>No saved addresses found.</p>
                  <button className="add-address-btn" onClick={() => setIsAddressModalOpen(true)}>
                    <Plus size={18} /> Add New Address
                  </button>
                </div>
              ) : (
                <>
                  <div className="address-options">
                    {addresses.map(addr => (
                      <label key={addr.id} className={`address-option ${selectedAddressId === addr.id ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                        />
                        <div className="address-option-content">
                          <span className="address-type-badge">{addr.type}</span>
                          <p>{addr.street}, {addr.city}</p>
                          <p>{addr.state} - {addr.pincode}</p>
                        </div>
                        {selectedAddressId === addr.id && <CheckCircle size={20} className="selected-check" />}
                      </label>
                    ))}
                  </div>
                  <button className="add-address-btn-secondary" onClick={() => setIsAddressModalOpen(true)}>
                    <Plus size={16} /> Add Another Address
                  </button>
                </>
              )}
            </div>

            <div className="checkout-section payment-section">
              <h2><CreditCard size={20} /> Payment Method</h2>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                  />
                  <div className="payment-option-content">
                    <span className="payment-name">Online / UPI</span>
                    <p>Pay securely with Razorpay (Google Pay, PhonePe, Paytm, Cards)</p>
                    {paymentMethod === 'online' && (
                      <div className="upi-apps-selector">
                        <div 
                          className={`upi-app ${selectedUPIApp === 'google_pay' ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedUPIApp('google_pay');
                            // Delay slightly to allow state to update before proceeding
                            setTimeout(() => {
                              handleProceedWithApp('google_pay');
                            }, 100);
                          }}
                        >
                          <img src="https://img.icons8.com/color/48/000000/google-pay.png" alt="Google Pay" />
                        </div>
                        <div 
                          className={`upi-app ${selectedUPIApp === 'phone_pe' ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedUPIApp('phone_pe');
                            setTimeout(() => {
                              handleProceedWithApp('phone_pe');
                            }, 100);
                          }}
                        >
                          <img src="https://img.icons8.com/color/48/000000/phone-pe.png" alt="PhonePe" />
                        </div>
                        <div 
                          className={`upi-app ${selectedUPIApp === 'paytm' ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedUPIApp('paytm');
                            setTimeout(() => {
                              handleProceedWithApp('paytm');
                            }, 100);
                          }}
                        >
                          <img src="https://img.icons8.com/color/48/000000/paytm.png" alt="Paytm" />
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="payment-option-content">
                    <span className="payment-name"><Banknote size={16} /> Cash on Delivery</span>
                    <p>Pay when you receive the order</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-right">
            <div className="checkout-section order-summary">
              <h2><ShoppingBag size={20} /> Order Summary</h2>
              <div className="order-items">
                {cartItems.map(item => (
                  <div key={item.itemId} className="order-item-card">
                    <div className="order-item-main">
                      <div className="order-item-img">
                        <img src={item.image || '/images/desi-gud-main.png'} alt={item.title} />
                      </div>
                      <div className="order-item-info">
                        <span className="order-item-name">{item.title}</span>
                        {item.weight && <span className="order-item-weight">{item.weight}</span>}
                        <div className="checkout-qty-controls">
                          <button onClick={() => updateCartItem(item.itemId, item.quantity - 1)} disabled={item.quantity <= 1}><Minus size={12} /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartItem(item.itemId, item.quantity + 1)}><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>
                    <div className="order-item-total">
                      <span className="unit-label">₹{item.price} each</span>
                      <span className="order-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-totals">
                <div className="total-row"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
                <div className="total-row"><span>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                {deliveryFee === 0 && <p className="free-delivery-note">🎉 You qualify for free delivery!</p>}
                <div className="total-row grand-total"><span>Total</span><span>₹{finalTotal.toFixed(2)}</span></div>
              </div>
               <button className="proceed-btn" onClick={handleProceed} disabled={loading}>
                {loading ? 'Processing...' : (paymentMethod === 'cod' ? 'Confirm COD Order' : 'Proceed to Pay')}
              </button>
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
