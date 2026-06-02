import React, { useState } from 'react';
import { Search, Eye, ShoppingCart, LogOut, ShieldAlert } from 'lucide-react';
import type { Artwork, CartItem } from '../types';

interface GalleryViewProps {
  artworks: Artwork[];
  cart: CartItem[];
  onOpenCart: () => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onSwitchToAdmin: () => void;
  onLogout: () => void;
  isArtistLoggedIn: boolean;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  artworks,
  cart,
  onOpenCart,
  onSelectArtwork,
  onSwitchToAdmin,
  onLogout,
  isArtistLoggedIn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Paintings', 'Prints', 'Digital'];

  // Filter artworks
  const filteredArtworks = artworks.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.medium.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory =
      activeCategory === 'All' || art.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); setActiveCategory('All'); }}>
            AURA<span>ART</span>
          </a>
          
          <div className="nav-actions">
            <button className="cart-icon-btn" onClick={onOpenCart} aria-label="Open Cart">
              <ShoppingCart size={24} />
              {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
            </button>

            {isArtistLoggedIn ? (
              <button className="btn btn-secondary btn-sm" onClick={onSwitchToAdmin}>
                Go to POS
              </button>
            ) : (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={onSwitchToAdmin}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ShieldAlert size={16} /> Artist POS
              </button>
            )}

            <button className="icon-btn" onClick={onLogout} title="Logout" style={{ padding: '8px' }}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section container">
        <h1>ArtFest Showcase</h1>
        <p>
          Discover original canvas works, limited edition prints, and digital creations by <strong>AURA Studio</strong>. Scan artwork QR codes at the booth to read full stories.
        </p>
      </header>

      {/* Controls: Search and Tabs */}
      <section className="container" style={{ minHeight: '60vh' }}>
        <div className="gallery-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by title, medium, details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredArtworks.length > 0 ? (
          <div className="art-grid">
            {filteredArtworks.map((art) => (
              <div key={art.id} className="art-card" onClick={() => onSelectArtwork(art)}>
                <div className="art-img-wrapper">
                  <img src={art.image} alt={art.title} className="art-img" loading="lazy" />
                  <div className="art-status-overlay">
                    <span
                      className={`badge ${
                        art.status === 'available'
                          ? 'badge-available'
                          : art.status === 'reserved'
                          ? 'badge-reserved'
                          : 'badge-sold'
                      }`}
                    >
                      {art.status}
                    </span>
                  </div>
                </div>

                <div className="art-card-details">
                  <div className="art-card-header">
                    <h3 className="art-card-title">{art.title}</h3>
                    <span className="art-card-price">${art.price}</span>
                  </div>
                  <p className="art-card-medium">{art.medium}</p>
                  <p className="art-card-desc">{art.description}</p>
                  
                  <div className="art-card-footer">
                    <span className="art-views">
                      <Eye size={14} /> {art.views} views
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 500 }}>
                      Read Details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No artworks found</p>
            <p style={{ fontSize: '0.9rem' }}>Try clearing filters or adjusting your search term.</p>
          </div>
        )}
      </section>
    </div>
  );
};
