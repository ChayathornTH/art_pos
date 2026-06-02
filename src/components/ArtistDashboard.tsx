import React, { useState } from 'react';
import { 
  LayoutDashboard, Plus, Edit2, Trash2, Coins, CreditCard, Send, 
  History, User, ArrowLeft, AlertTriangle, ShoppingBag, Eye
} from 'lucide-react';
import type { Artwork, SaleTransaction, AppSettings } from '../types';

interface ArtistDashboardProps {
  artworks: Artwork[];
  transactions: SaleTransaction[];
  settings: AppSettings;
  onAddArtwork: (artwork: Omit<Artwork, 'id' | 'views' | 'createdAt'>) => void;
  onUpdateArtwork: (artwork: Artwork) => void;
  onDeleteArtwork: (id: string) => void;
  onCompleteSale: (items: Artwork[], paymentMethod: 'cash' | 'card' | 'transfer', buyerName: string, buyerContact: string, notes: string) => SaleTransaction;
  onSwitchToGallery: () => void;
  onResetDatabase: () => void;
}

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({
  artworks,
  transactions,
  settings,
  onAddArtwork,
  onUpdateArtwork,
  onDeleteArtwork,
  onCompleteSale,
  onSwitchToGallery,
  onResetDatabase,
}) => {
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'analytics'>('pos');
  
  // POS State
  const [posCart, setPosCart] = useState<Artwork[]>([]);
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [lastReceipt, setLastReceipt] = useState<SaleTransaction | null>(null);

  // Form State for Add/Edit Artwork
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artPrice, setArtPrice] = useState(0);
  const [artDimensions, setArtDimensions] = useState('');
  const [artMedium, setArtMedium] = useState('');
  const [artCategory, setArtCategory] = useState('Paintings');
  const [artDescription, setArtDescription] = useState('');
  const [artImage, setArtImage] = useState('/images/sunset_resonance.png');
  const [artStatus, setArtStatus] = useState<'available' | 'reserved' | 'sold'>('available');
  const [showAddForm, setShowAddForm] = useState(false);

  // Image Presets for demo
  const IMAGE_PRESETS = [
    { name: 'Sunset Resonance', path: '/images/sunset_resonance.png' },
    { name: 'Monochrome Whisper', path: '/images/monochrome_whisper.png' },
    { name: 'Golden Hour Forest', path: '/images/golden_hour_forest.png' },
    { name: 'Neon Cyber Lotus', path: '/images/neon_cyber_lotus.png' }
  ];

  // POS Cart management
  const handleTogglePosItem = (art: Artwork) => {
    if (art.status !== 'available') return;
    
    if (posCart.some(item => item.id === art.id)) {
      setPosCart(posCart.filter(item => item.id !== art.id));
    } else {
      setPosCart([...posCart, art]);
    }
    setLastReceipt(null);
  };

  const handlePOSCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (posCart.length === 0) return;

    const receipt = onCompleteSale(
      posCart,
      paymentMethod,
      buyerName,
      buyerContact,
      txNotes
    );

    setLastReceipt(receipt);
    setPosCart([]);
    setBuyerName('');
    setBuyerContact('');
    setTxNotes('');
  };

  // Inventory forms management
  const handleOpenAddForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setArtTitle('');
    setArtPrice(0);
    setArtDimensions('20 x 24 inches');
    setArtMedium('Original Oil on Canvas');
    setArtCategory('Paintings');
    setArtDescription('');
    setArtImage('/images/sunset_resonance.png');
    setArtStatus('available');
    setShowAddForm(true);
  };

  const handleOpenEditForm = (art: Artwork) => {
    setIsEditing(true);
    setEditingId(art.id);
    setArtTitle(art.title);
    setArtPrice(art.price);
    setArtDimensions(art.dimensions);
    setArtMedium(art.medium);
    setArtCategory(art.category);
    setArtDescription(art.description);
    setArtImage(art.image);
    setArtStatus(art.status);
    setShowAddForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingId) {
      const existing = artworks.find(a => a.id === editingId);
      if (existing) {
        onUpdateArtwork({
          ...existing,
          title: artTitle,
          price: Number(artPrice),
          dimensions: artDimensions,
          medium: artMedium,
          category: artCategory,
          description: artDescription,
          image: artImage,
          status: artStatus
        });
      }
    } else {
      onAddArtwork({
        title: artTitle,
        price: Number(artPrice),
        dimensions: artDimensions,
        medium: artMedium,
        category: artCategory,
        description: artDescription,
        image: artImage,
        status: artStatus
      });
    }
    setShowAddForm(false);
  };

  // Analytics helper calculations
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalSold = artworks.filter(a => a.status === 'sold').length;
  const totalAvailable = artworks.filter(a => a.status === 'available').length;
  const totalViews = artworks.reduce((sum, a) => sum + a.views, 0);

  // Chart data calculations
  const salesByCategory = artworks.reduce((acc, a) => {
    if (a.status === 'sold') {
      acc[a.category] = (acc[a.category] || 0) + a.price;
    }
    return acc;
  }, {} as Record<string, number>);

  const methodBreakdown = transactions.reduce((acc, tx) => {
    acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + tx.totalAmount;
    return acc;
  }, { cash: 0, card: 0, transfer: 0 } as Record<string, number>);

  const maxCategorySales = Math.max(...Object.values(salesByCategory), 1);
  const maxMethodSales = Math.max(...Object.values(methodBreakdown), 1);

  return (
    <div className="admin-layout">
      {/* Top Admin Header Bar */}
      <header className="admin-header">
        <div className="container admin-header-row">
          <button className="btn btn-secondary btn-sm" onClick={onSwitchToGallery} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Return to Gallery
          </button>
          
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.4rem', fontWeight: 600 }}>
            Artist Control <span>& POS</span>
          </h2>

          <div className="admin-tabs">
            <button 
              className={`admin-tab ${activeTab === 'pos' ? 'active' : ''}`}
              onClick={() => { setActiveTab('pos'); setLastReceipt(null); }}
            >
              <ShoppingBag size={16} /> POS Terminal
            </button>
            <button 
              className={`admin-tab ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => { setActiveTab('inventory'); setShowAddForm(false); }}
            >
              <LayoutDashboard size={16} /> Inventory
            </button>
            <button 
              className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => { setActiveTab('analytics'); }}
            >
              <History size={16} /> Sales & Analytics
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="admin-content-section container">
        
        {/* TAB 1: POS TERMINAL */}
        {activeTab === 'pos' && (
          <div className="pos-screen">
            {/* Catalog Grid */}
            <div className="pos-catalog-panel">
              <h3 className="chart-title" style={{ marginBottom: '16px' }}>Select Art to Sell</h3>
              <div className="pos-grid">
                {artworks.map((art) => {
                  const isSelected = posCart.some(item => item.id === art.id);
                  return (
                    <div 
                      key={art.id} 
                      className={`pos-art-item ${isSelected ? 'selected' : ''} ${art.status !== 'available' ? 'sold' : ''}`}
                      onClick={() => handleTogglePosItem(art)}
                      style={{ opacity: art.status !== 'available' ? 0.45 : 1 }}
                    >
                      <img src={art.image} alt={art.title} className="pos-art-img" />
                      <div className="pos-art-title">{art.title}</div>
                      <div className="pos-art-price">${art.price}</div>
                      
                      {art.status !== 'available' && (
                        <div className="pos-art-sold-badge">{art.status}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* POS Checkout & Receipt Drawer */}
            <div className="pos-cart-panel glass-panel">
              <h3 className="chart-title">Sales Checkout</h3>
              
              {posCart.length > 0 ? (
                <form onSubmit={handlePOSCheckout}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {posCart.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                        <span>{item.title}</span>
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>${item.price}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>Total Due</span>
                      <span style={{ color: 'var(--accent-gold)' }}>
                        ${posCart.reduce((sum, item) => sum + item.price, 0)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="form-group">
                    <label className="form-label">Buyer Name (Optional)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. John Doe"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Buyer Email / Phone (Optional)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. john@example.com"
                      value={buyerContact}
                      onChange={(e) => setBuyerContact(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Internal Sale Notes</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Needs delivery by Sunday"
                      value={txNotes}
                      onChange={(e) => setTxNotes(e.target.value)}
                    />
                  </div>

                  {/* Payment Methods */}
                  <div className="form-label">Payment Method</div>
                  <div className="payment-grid">
                    <div 
                      className={`payment-opt ${paymentMethod === 'cash' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <Coins size={20} /> Cash
                    </div>
                    <div 
                      className={`payment-opt ${paymentMethod === 'card' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <CreditCard size={20} /> Card Reader
                    </div>
                    <div 
                      className={`payment-opt ${paymentMethod === 'transfer' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('transfer')}
                    >
                      <Send size={20} /> Bank Transfer
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Complete & Record Sale
                  </button>
                </form>
              ) : lastReceipt ? (
                <div>
                  <div style={{ color: 'var(--color-available)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                    ✔ Transaction Completed Successfully
                  </div>

                  {/* Beautiful Vintage POS Monospace Receipt */}
                  <div className="receipt-box">
                    <div className="receipt-header">
                      <div className="receipt-title">{settings.shopName}</div>
                      <div>ARTFEST 2026 BOOTH RECEIPT</div>
                      <div>Date: {new Date(lastReceipt.timestamp).toLocaleString()}</div>
                      <div>ID: {lastReceipt.id.slice(0, 13).toUpperCase()}</div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      {lastReceipt.items.map((item, idx) => (
                        <div key={idx} className="receipt-row">
                          <span>{item.title} (x{item.quantity})</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="receipt-total">
                      <div className="receipt-row">
                        <span>SUBTOTAL</span>
                        <span>${lastReceipt.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="receipt-row">
                        <span>TAX (0%)</span>
                        <span>$0.00</span>
                      </div>
                      <div className="receipt-row" style={{ fontWeight: 'bold' }}>
                        <span>TOTAL PAID</span>
                        <span>${lastReceipt.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', borderTop: '1px dashed #d6d3d1', paddingTop: '12px' }}>
                      <div className="receipt-row">
                        <span>PAYMENT TYPE</span>
                        <span style={{ textTransform: 'uppercase' }}>{lastReceipt.paymentMethod}</span>
                      </div>
                      {lastReceipt.buyerName && (
                        <div className="receipt-row">
                          <span>BUYER</span>
                          <span>{lastReceipt.buyerName}</span>
                        </div>
                      )}
                      {lastReceipt.buyerContact && (
                        <div className="receipt-row">
                          <span>CONTACT</span>
                          <span>{lastReceipt.buyerContact}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#78716c' }}>
                      THANK YOU FOR SUPPORTING INDEPENDENT ARTISTS!
                    </div>
                  </div>

                  <button className="btn btn-secondary btn-sm" onClick={() => setLastReceipt(null)} style={{ width: '100%', marginTop: '20px' }}>
                    New Transaction
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  <ShoppingBag size={48} style={{ marginBottom: '12px', strokeWidth: 1 }} />
                  <p>Cart is Empty</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Click available artworks on the left list to start checkout.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY MANAGER */}
        {activeTab === 'inventory' && (
          <div>
            {!showAddForm ? (
              <div className="inventory-list">
                <div className="inventory-toolbar">
                  <h3 className="chart-title" style={{ margin: 0 }}>Booth Inventory</h3>
                  <button className="btn btn-primary btn-sm" onClick={handleOpenAddForm}>
                    <Plus size={16} /> Add New Artwork
                  </button>
                </div>
                
                <div className="table-wrapper">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>Artwork / Title</th>
                        <th>Category</th>
                        <th>Medium</th>
                        <th>Price</th>
                        <th>Dimensions</th>
                        <th>Status</th>
                        <th>Scans</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artworks.map(art => (
                        <tr key={art.id}>
                          <td>
                            <div className="table-art-preview">
                              <img src={art.image} alt={art.title} className="table-art-img" />
                              <div>
                                <span className="table-art-title">{art.title}</span>
                              </div>
                            </div>
                          </td>
                          <td>{art.category}</td>
                          <td style={{ fontSize: '0.85rem' }}>{art.medium}</td>
                          <td style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>${art.price}</td>
                          <td>{art.dimensions}</td>
                          <td>
                            <span className={`badge ${
                              art.status === 'available' ? 'badge-available' :
                              art.status === 'reserved' ? 'badge-reserved' : 'badge-sold'
                            }`}>
                              {art.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Eye size={14} /> {art.views}
                            </div>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="icon-btn" title="Edit" onClick={() => handleOpenEditForm(art)}>
                                <Edit2 size={14} />
                              </button>
                              <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => onDeleteArtwork(art.id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Add / Edit Artwork Form Panel
              <div className="glass-panel form-panel" style={{ maxWidth: '650px', margin: '0 auto' }}>
                <h3 className="chart-title">{isEditing ? 'Modify Artwork' : 'Catalog New Piece'}</h3>
                
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label className="form-label">Artwork Title</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      required
                      value={artTitle}
                      onChange={(e) => setArtTitle(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Price ($ USD)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        required
                        value={artPrice}
                        onChange={(e) => setArtPrice(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select 
                        className="input-field"
                        value={artCategory}
                        onChange={(e) => setArtCategory(e.target.value)}
                      >
                        <option value="Paintings">Paintings</option>
                        <option value="Prints">Prints</option>
                        <option value="Digital">Digital</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Medium Details</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="e.g. Acrylic on Canvas"
                        required
                        value={artMedium}
                        onChange={(e) => setArtMedium(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dimensions</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="e.g. 16 x 20 inches"
                        required
                        value={artDimensions}
                        onChange={(e) => setArtDimensions(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Preset Image Select or URL */}
                  <div className="form-group">
                    <label className="form-label">Artwork Image Asset</label>
                    <select 
                      className="input-field"
                      value={artImage}
                      onChange={(e) => setArtImage(e.target.value)}
                    >
                      {IMAGE_PRESETS.map((preset, idx) => (
                        <option key={idx} value={preset.path}>
                          Preset: {preset.name}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'center' }}>
                      <img src={artImage} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selected asset preview</span>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="form-group">
                      <label className="form-label">Availability Status</label>
                      <select 
                        className="input-field"
                        value={artStatus}
                        onChange={(e) => setArtStatus(e.target.value as any)}
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Artwork Backstory / Story Description</label>
                    <textarea 
                      className="input-field" 
                      rows={4}
                      style={{ resize: 'vertical' }}
                      value={artDescription}
                      onChange={(e) => setArtDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {isEditing ? 'Save Updates' : 'Add to Catalog'}
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANALYTICS & LOG */}
        {activeTab === 'analytics' && (
          <div>
            {/* Stats Dashboard Grid */}
            <div className="stats-grid">
              <div className="stat-card glass-panel">
                <div className="stat-card-title">Gross Revenue</div>
                <div className="stat-card-value gold">${totalRevenue}</div>
                <div className="stat-card-sub">Recorded sales at booth</div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-card-title">Artworks Sold</div>
                <div className="stat-card-value">{totalSold}</div>
                <div className="stat-card-sub">Originals & prints sold</div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-card-title">Active Catalog</div>
                <div className="stat-card-value">{totalAvailable}</div>
                <div className="stat-card-sub">Items currently available</div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-card-title">Total QR Scans</div>
                <div className="stat-card-value">{totalViews}</div>
                <div className="stat-card-sub">Artwork QR detail scans</div>
              </div>
            </div>

            {/* Split view: Charts and Transaction Log */}
            <div className="dashboard-split">
              <div>
                {/* Visual Sales Chart */}
                <div className="chart-panel glass-panel">
                  <h3 className="chart-title">Revenue by Category</h3>
                  
                  <div className="chart-list" style={{ marginBottom: '32px' }}>
                    {Object.entries(salesByCategory).length > 0 ? (
                      Object.entries(salesByCategory).map(([cat, val]) => {
                        const pct = (val / maxCategorySales) * 100;
                        return (
                          <div key={cat} className="chart-bar-row">
                            <div className="chart-bar-label">{cat}</div>
                            <div className="chart-bar-container">
                              <div className="chart-bar-fill" style={{ width: `${pct}%` }}></div>
                            </div>
                            <div className="chart-bar-val">${val}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No sales data yet.</div>
                    )}
                  </div>

                  <h3 className="chart-title">Sales by Payment Method</h3>
                  <div className="chart-list">
                    {Object.entries(methodBreakdown).map(([method, val]) => {
                      const pct = (val / maxMethodSales) * 100;
                      return (
                        <div key={method} className="chart-bar-row">
                          <div className="chart-bar-label" style={{ textTransform: 'capitalize' }}>{method}</div>
                          <div className="chart-bar-container">
                            <div className="chart-bar-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                          <div className="chart-bar-val">${val}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Database Actions */}
                <div className="chart-panel glass-panel" style={{ border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  <h3 className="chart-title" style={{ color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={20} /> System Settings
                  </h3>
                  <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                    Resetting the database will restore all original mock artworks, reset view counts, and delete the transaction log.
                  </p>
                  <button className="btn btn-danger btn-sm" onClick={() => {
                    if (window.confirm('Are you sure you want to reset the database? All recorded transactions and custom additions will be lost.')) {
                      onResetDatabase();
                    }
                  }}>
                    Reset Application Database
                  </button>
                </div>
              </div>

              {/* Transaction Ledger Log List */}
              <div>
                <h3 className="chart-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={20} /> Sales Ledger
                </h3>

                <div className="transaction-list">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <div key={tx.id} className="transaction-card">
                        <div className="tx-header">
                          <span className="tx-id">TX #{tx.id.substring(0, 8).toUpperCase()}</span>
                          <span className="tx-date">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        
                        <div className="tx-details">
                          <div className="tx-items">
                            {tx.items.map((item, idx) => (
                              <div key={idx} className="tx-item-row">
                                {item.title} <span className="tx-item-qty">x{item.quantity}</span>
                              </div>
                            ))}
                            {tx.buyerName && (
                              <div className="tx-buyer">
                                <User size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                {tx.buyerName} {tx.buyerContact && `(${tx.buyerContact})`}
                              </div>
                            )}
                          </div>
                          
                          <div className="tx-summary">
                            <div className="tx-amount">${tx.totalAmount}</div>
                            <div className="tx-method">{tx.paymentMethod}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '40px 0', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                      No transactions recorded.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
