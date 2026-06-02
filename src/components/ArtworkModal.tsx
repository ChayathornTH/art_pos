import React, { useEffect, useRef } from 'react';
import { X, ShoppingCart, MessageSquare, Mail, Info } from 'lucide-react';
import QRCode from 'qrcode';
import type { Artwork } from '../types';

interface ArtworkModalProps {
  artwork: Artwork;
  onClose: () => void;
  onAddToCart: (artwork: Artwork) => void;
  isInCart: boolean;
  whatsappNumber?: string;
}

export const ArtworkModal: React.FC<ArtworkModalProps> = ({
  artwork,
  onClose,
  onAddToCart,
  isInCart,
  whatsappNumber = '+1234567890',
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrCanvasRef.current) {
      const shareUrl = `${window.location.origin}?art=${artwork.id}`;
      QRCode.toCanvas(
        qrCanvasRef.current,
        shareUrl,
        {
          width: 90,
          margin: 1,
          color: {
            dark: '#1c1c22',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [artwork.id]);

  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Hi! I'm at your ArtFest booth and interested in "${artwork.title}" (${artwork.medium}, $${artwork.price}). Is this piece still available to purchase?`
    );
    return `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${text}`;
  };

  const getEmailLink = () => {
    const subject = encodeURIComponent(`Inquiry: "${artwork.title}" at ArtFest`);
    const body = encodeURIComponent(
      `Hello,\n\nI saw your artwork "${artwork.title}" (${artwork.medium}) at the ArtFest and would love to know more about it. Please let me know if it is available or if you take custom commissions similar to this piece.\n\nThank you!`
    );
    return `mailto:artist@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-body">
          {/* Left Side: Art Image */}
          <div className="modal-img-container">
            <img src={artwork.image} alt={artwork.title} className="modal-img" />
          </div>

          {/* Right Side: Info Panel */}
          <div className="modal-info-panel">
            <span
              className={`badge ${
                artwork.status === 'available'
                  ? 'badge-available'
                  : artwork.status === 'reserved'
                  ? 'badge-reserved'
                  : 'badge-sold'
              }`}
              style={{ width: 'fit-content', marginBottom: '16px' }}
            >
              {artwork.status}
            </span>

            <h2>{artwork.title}</h2>
            <div className="modal-price">${artwork.price}</div>

            {/* Specifications Grid */}
            <div className="specs-grid">
              <div>
                <div className="spec-item-label">Medium</div>
                <div className="spec-item-value">{artwork.medium}</div>
              </div>
              <div>
                <div className="spec-item-label">Dimensions</div>
                <div className="spec-item-value">{artwork.dimensions}</div>
              </div>
              <div>
                <div className="spec-item-label">Category</div>
                <div className="spec-item-value">{artwork.category}</div>
              </div>
              <div>
                <div className="spec-item-label">Views</div>
                <div className="spec-item-value">{artwork.views} scans</div>
              </div>
            </div>

            {/* Backstory */}
            <div className="spec-item-label" style={{ marginBottom: '6px' }}>Artwork Story</div>
            <p className="modal-desc">{artwork.description}</p>

            {/* Actions */}
            <div className="modal-actions">
              {artwork.status === 'available' ? (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    onAddToCart(artwork);
                  }}
                  disabled={isInCart}
                >
                  <ShoppingCart size={18} />
                  {isInCart ? 'Added to Cart' : 'Add to Cart / Buy'}
                </button>
              ) : artwork.status === 'reserved' ? (
                <div 
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: 'var(--color-reserved)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px'
                  }}
                >
                  <Info size={16} /> This artwork is currently reserved. You can still message us to express interest.
                </div>
              ) : (
                <div 
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: 'var(--color-sold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px'
                  }}
                >
                  <Info size={16} /> This original has been sold, but you can inquire for prints or commissions.
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <a href={getWhatsAppLink()} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                  <MessageSquare size={16} /> WhatsApp Inquiry
                </a>
                <a href={getEmailLink()} className="btn btn-secondary btn-sm">
                  <Mail size={16} /> Email Artist
                </a>
              </div>
            </div>

            {/* QR Scan Section */}
            <div className="qr-code-section">
              <canvas ref={qrCanvasRef} className="qr-code-canvas"></canvas>
              <div>
                <div className="spec-item-label" style={{ color: 'var(--accent-gold)' }}>Booth Scan Pass</div>
                <div className="qr-code-text">
                  Scan this QR code with your phone camera to open this piece on your mobile screen.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
