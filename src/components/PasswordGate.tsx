import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordGateProps {
  onUnlock: (role: 'guest' | 'artist') => void;
  guestCode: string;
  artistCode: string;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ onUnlock, guestCode, artistCode }) => {
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toLowerCase();
    
    if (cleanCode === guestCode.toLowerCase()) {
      onUnlock('guest');
    } else if (cleanCode === artistCode.toLowerCase()) {
      onUnlock('artist');
    } else {
      setError('Invalid access code. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="lockscreen-container">
      <div className="lockscreen-card glass-panel">
        <div className="lockscreen-icon">
          <Lock size={32} />
        </div>
        
        <h1 className="lockscreen-logo">
          AURA<span>ART</span>
        </h1>
        
        <p style={{ marginBottom: '30px', color: 'var(--text-secondary)' }}>
          Welcome to ArtFest 2026. Please enter your gallery access passcode or POS terminal PIN.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Access Passcode</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Enter passcode..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
              style={{ paddingRight: '48px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '10px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <p style={{ color: 'var(--color-sold)', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'left' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Unlock Showcase
          </button>
        </form>

        <div className="lockscreen-info">
          <p style={{ fontWeight: 500, color: 'var(--accent-gold)', marginBottom: '4px' }}>Demo Credentials</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Enter <code style={{ padding: '2px 4px', fontSize: '0.75rem' }}>guest</code> to view client catalog
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Enter <code style={{ padding: '2px 4px', fontSize: '0.75rem' }}>artist</code> to open POS Terminal
          </p>
        </div>
      </div>
    </div>
  );
};
