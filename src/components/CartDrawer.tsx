import React, { useState } from 'react';
import { X, Trash2, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { CartItem, AppSettings } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (artworkId: string) => void;
  onClearCart: () => void;
  settings: AppSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  onClearCart,
  settings,
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'completed'>('cart');
  const [paymentChoice, setPaymentChoice] = useState<'transfer' | 'cash'>('transfer');

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.artwork.price * item.quantity, 0);

  const handleCheckoutSubmit = () => {
    setCheckoutStep('completed');
  };

  const handleCloseAndReset = () => {
    onClearCart();
    setCheckoutStep('cart');
    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 className="drawer-title">
            {checkoutStep === 'cart' && 'Your Selected Art'}
            {checkoutStep === 'payment' && 'Complete Checkout'}
            {checkoutStep === 'completed' && 'Order Placed!'}
          </h3>
          <button className="drawer-close" onClick={onClose} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        {/* STEP 1: CART OVERVIEW */}
        {checkoutStep === 'cart' && (
          <>
            <div className="drawer-items">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.artwork.id} className="cart-item">
                    <img src={item.artwork.image} alt={item.artwork.title} className="cart-item-img" />
                    
                    <div className="cart-item-details">
                      <div>
                        <div className="cart-item-title">{item.artwork.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.artwork.medium}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="cart-item-price">${item.artwork.price}</div>
                        <button className="cart-item-remove" onClick={() => onRemoveItem(item.artwork.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Your cart is empty</p>
                  <p style={{ fontSize: '0.85rem' }}>Browse the gallery and add available artworks to get started.</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="drawer-footer">
                <div className="cart-total-row">
                  <span>Grand Total</span>
                  <span className="cart-total-val">${total}</span>
                </div>
                
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setCheckoutStep('payment')}>
                  Proceed to Payment <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: PAYMENT & TRANSFER DETAILS */}
        {checkoutStep === 'payment' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flexGrow: 1, overflowY: 'auto', textAlign: 'left' }}>
              <p style={{ fontSize: '0.95rem', marginBottom: '20px' }}>
                Please select your payment method below to complete the purchase at the booth.
              </p>

              {/* Payment Methods Choice */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <button 
                  className={`btn ${paymentChoice === 'transfer' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '0.85rem', padding: '10px' }}
                  onClick={() => setPaymentChoice('transfer')}
                >
                  Bank Transfer / Venmo
                </button>
                <button 
                  className={`btn ${paymentChoice === 'cash' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, fontSize: '0.85rem', padding: '10px' }}
                  onClick={() => setPaymentChoice('cash')}
                >
                  Pay in Cash at Booth
                </button>
              </div>

              {paymentChoice === 'transfer' ? (
                <div>
                  <div className="form-label" style={{ color: 'var(--accent-gold)' }}>Payment Transfer Details</div>
                  
                  {/* Styled Transfer Block */}
                  <div 
                    style={{ 
                      backgroundColor: 'var(--bg-tertiary)', 
                      padding: '16px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-light)',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      whiteSpace: 'pre-wrap',
                      color: 'var(--text-primary)',
                      marginBottom: '20px',
                      lineHeight: '1.5'
                    }}
                  >
                    {settings.paymentTransferDetails}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    Once you make the transfer on your mobile banking/Venmo app, please click the button below to confirm. The artist will verify the transfer at the POS desk.
                  </p>
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <ShieldAlert size={24} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', fontWeight: 600 }}>Cash Payment</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Please tell the artist your name and show them your phone to complete your checkout with cash.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <div className="cart-total-row">
                <span>Amount to Pay</span>
                <span className="cart-total-val">${total}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setCheckoutStep('cart')}>
                  Back
                </button>
                <button className="btn btn-primary" style={{ flex: 1.5 }} onClick={handleCheckoutSubmit}>
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ORDER COMPLETED */}
        {checkoutStep === 'completed' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-available)', marginBottom: '20px' }}>
              <CheckCircle2 size={64} style={{ strokeWidth: 1.5 }} />
            </div>
            
            <h4 style={{ fontSize: '1.5rem', marginBottom: '12px', fontFamily: 'var(--font-serif)' }}>Thank You!</h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '300px' }}>
              Your order request of <strong>${total}</strong> has been logged. 
            </p>

            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '32px', textAlign: 'left', width: '100%' }}>
              <h5 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>What happens next?</h5>
              <ol style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Show this screen to the artist at the desk.</li>
                <li>The artist will print your official receipt.</li>
                <li>Pick up your physical artwork or print!</li>
              </ol>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCloseAndReset}>
              Close & Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
