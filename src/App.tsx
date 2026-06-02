import { useState, useEffect } from 'react';
import { INITIAL_ARTWORKS } from './mockData';
import type { Artwork, SaleTransaction, CartItem, AppSettings } from './types';
import { PasswordGate } from './components/PasswordGate';
import { GalleryView } from './components/GalleryView';
import { ArtworkModal } from './components/ArtworkModal';
import { CartDrawer } from './components/CartDrawer';
import { ArtistDashboard } from './components/ArtistDashboard';
import { CheckCircle2 } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  guestPassword: 'guest',
  artistPassword: 'artist',
  shopName: 'AURA Art Studio',
  paymentTransferDetails: 'PAYMENT DETAILS:\n\n- Venmo: @AuraArtStudio\n- Bank: Chase Bank\n- Routing: 021000021\n- Account: 1234-5678-9012\n\n*Please show receipt screenshot to the artist.',
  whatsappNumber: '+1234567890',
};

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  const [unlockedRole, setUnlockedRole] = useState<'guest' | 'artist' | null>(null);
  const [currentView, setCurrentView] = useState<'gallery' | 'admin'>('gallery');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedArtworks = localStorage.getItem('artfest_artworks');
    const savedTransactions = localStorage.getItem('artfest_transactions');
    const savedSettings = localStorage.getItem('artfest_settings');

    if (savedArtworks) {
      setArtworks(JSON.parse(savedArtworks));
    } else {
      setArtworks(INITIAL_ARTWORKS);
      localStorage.setItem('artfest_artworks', JSON.stringify(INITIAL_ARTWORKS));
    }

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      setTransactions([]);
      localStorage.setItem('artfest_transactions', JSON.stringify([]));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('artfest_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
  }, []);

  useEffect(() => {
    if (artworks.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const artId = params.get('art');

    if (artId) {
      const art = artworks.find(a => a.id === artId);
      if (art) {
        const hasScanned = sessionStorage.getItem(`scanned_${artId}`);
        if (!hasScanned) {
          const updatedArtworks = artworks.map(a => 
            a.id === artId ? { ...a, views: a.views + 1 } : a
          );
          setArtworks(updatedArtworks);
          localStorage.setItem('artfest_artworks', JSON.stringify(updatedArtworks));
          sessionStorage.setItem(`scanned_${artId}`, 'true');
        }
        setSelectedArtwork(art);
      }
    }
  }, [artworks.length]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleUnlock = (role: 'guest' | 'artist') => {
    setUnlockedRole(role);
    if (role === 'artist') {
      setCurrentView('admin');
      triggerToast('POS Admin Access Unlocked');
    } else {
      setCurrentView('gallery');
      triggerToast('Welcome to the Art Gallery!');
    }
  };

  const handleLogout = () => {
    setUnlockedRole(null);
    setCurrentView('gallery');
    setCart([]);
    setSelectedArtwork(null);
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    triggerToast('Logged Out Successfully');
  };

  const handleAddToCart = (artwork: Artwork) => {
    if (artwork.status !== 'available') {
      triggerToast('Artwork is no longer available');
      return;
    }

    const existingIndex = cart.findIndex(item => item.artwork.id === artwork.id);
    if (existingIndex >= 0) {
      triggerToast('Already in cart');
    } else {
      setCart([...cart, { artwork, quantity: 1 }]);
      triggerToast(`"${artwork.title}" added to checkout cart`);
    }
  };

  const handleRemoveFromCart = (artworkId: string) => {
    setCart(cart.filter(item => item.artwork.id !== artworkId));
    triggerToast('Item removed from cart');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCompletePOSSale = (
    items: Artwork[],
    paymentMethod: 'cash' | 'card' | 'transfer',
    buyerName: string,
    buyerContact: string,
    notes: string
  ) => {
    const newTx: SaleTransaction = {
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      items: items.map(art => ({
        artworkId: art.id,
        title: art.title,
        price: art.price,
        quantity: 1
      })),
      totalAmount: items.reduce((sum, art) => sum + art.price, 0),
      paymentMethod,
      buyerName: buyerName || undefined,
      buyerContact: buyerContact || undefined,
      notes: notes || undefined
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    localStorage.setItem('artfest_transactions', JSON.stringify(updatedTx));

    const soldIds = items.map(item => item.id);
    const updatedArtworks = artworks.map(art => 
      soldIds.includes(art.id) ? { ...art, status: 'sold' as const } : art
    );
    setArtworks(updatedArtworks);
    localStorage.setItem('artfest_artworks', JSON.stringify(updatedArtworks));

    if (selectedArtwork && soldIds.includes(selectedArtwork.id)) {
      setSelectedArtwork({ ...selectedArtwork, status: 'sold' as const });
    }

    triggerToast(`Recorded sale of ${items.length} artwork(s)`);
    return newTx;
  };

  const handleAddArtwork = (newArt: Omit<Artwork, 'id' | 'views' | 'createdAt'>) => {
    const artworkEntry: Artwork = {
      ...newArt,
      id: `art-${Math.random().toString(36).substr(2, 9)}`,
      views: 0,
      createdAt: new Date().toISOString()
    };

    const updatedArtworks = [...artworks, artworkEntry];
    setArtworks(updatedArtworks);
    localStorage.setItem('artfest_artworks', JSON.stringify(updatedArtworks));
    triggerToast(`Added "${newArt.title}" to catalog`);
  };

  const handleUpdateArtwork = (updatedArt: Artwork) => {
    const updated = artworks.map(art => 
      art.id === updatedArt.id ? updatedArt : art
    );
    setArtworks(updated);
    localStorage.setItem('artfest_artworks', JSON.stringify(updated));

    if (selectedArtwork && selectedArtwork.id === updatedArt.id) {
      setSelectedArtwork(updatedArt);
    }
    triggerToast(`Updated "${updatedArt.title}" details`);
  };

  const handleDeleteArtwork = (id: string) => {
    const target = artworks.find(art => art.id === id);
    if (!target) return;

    if (window.confirm(`Are you sure you want to delete "${target.title}"?`)) {
      const updated = artworks.filter(art => art.id !== id);
      setArtworks(updated);
      localStorage.setItem('artfest_artworks', JSON.stringify(updated));
      triggerToast(`Removed "${target.title}"`);
    }
  };

  const handleResetDatabase = () => {
    localStorage.removeItem('artfest_artworks');
    localStorage.removeItem('artfest_transactions');
    localStorage.removeItem('artfest_settings');

    setArtworks(INITIAL_ARTWORKS);
    setTransactions([]);
    setSettings(DEFAULT_SETTINGS);

    localStorage.setItem('artfest_artworks', JSON.stringify(INITIAL_ARTWORKS));
    localStorage.setItem('artfest_transactions', JSON.stringify([]));
    localStorage.setItem('artfest_settings', JSON.stringify(DEFAULT_SETTINGS));

    setCart([]);
    setSelectedArtwork(null);
    triggerToast('Database reset to original mock items');
  };

  if (!unlockedRole) {
    return (
      <PasswordGate 
        onUnlock={handleUnlock}
        guestCode={settings.guestPassword || 'guest'}
        artistCode={settings.artistPassword || 'artist'}
      />
    );
  }

  return (
    <>
      {currentView === 'gallery' ? (
        <GalleryView
          artworks={artworks}
          cart={cart}
          onOpenCart={() => setIsCartOpen(true)}
          onSelectArtwork={(art) => setSelectedArtwork(art)}
          onSwitchToAdmin={() => setCurrentView('admin')}
          onLogout={handleLogout}
          isArtistLoggedIn={unlockedRole === 'artist'}
        />
      ) : (
        <ArtistDashboard
          artworks={artworks}
          transactions={transactions}
          settings={settings}
          onAddArtwork={handleAddArtwork}
          onUpdateArtwork={handleUpdateArtwork}
          onDeleteArtwork={handleDeleteArtwork}
          onCompleteSale={handleCompletePOSSale}
          onSwitchToGallery={() => setCurrentView('gallery')}
          onResetDatabase={handleResetDatabase}
        />
      )}

      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          onAddToCart={handleAddToCart}
          isInCart={cart.some(item => item.artwork.id === selectedArtwork.id)}
          whatsappNumber={settings.whatsappNumber}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        settings={settings}
      />

      {toastMessage && (
        <div className="toast-msg">
          <CheckCircle2 size={18} style={{ color: 'var(--accent-gold)' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

export default App;
