import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import '../../assets/styles/CartDrawer.css';

const CartDrawer = () => {
  const { cartItems, cartTotal, isCartOpen, setIsCartOpen, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleBuyNow = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={() => setIsCartOpen(false)} />
      <div className={`cart-drawer ${isCartOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h3><ShoppingBag size={22} /> Your Cart <span className="cart-count">({cartItems.length})</span></h3>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}><X size={22} /></button>
        </div>

        <div className="cart-items-wrapper">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={60} opacity={0.2} />
              <p>Your cart is empty</p>
              <button onClick={() => { setIsCartOpen(false); navigate('/'); }} className="cart-shop-btn">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map(item => (
                <div key={item.itemId} className="cart-item">
                  <div className="cart-item-image">
                    <img src={item.image || '/images/desi-gud-main.png'} alt={item.title} />
                  </div>
                  <div className="cart-item-details">
                    <p className="cart-item-title">{item.title}</p>
                    {item.weight && <span className="cart-item-weight">{item.weight}</span>}
                    <div className="cart-item-price-row">
                      <span className="unit-price">₹{item.price.toFixed(2)} × {item.quantity}</span>
                      <p className="line-total">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateCartItem(item.itemId, item.quantity - 1)}
                        disabled={item.quantity <= 0}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button onClick={() => updateCartItem(item.itemId, item.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.itemId)} title="Remove item">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <p className="cart-delivery-note">Shipping & taxes calculated at checkout</p>
            <button className="cart-buy-btn" onClick={handleBuyNow}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(CartDrawer);
