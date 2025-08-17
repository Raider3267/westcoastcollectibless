'use client'

import { useState, useEffect } from 'react'
import { AuthService, User } from '../lib/auth'
import AuthModal from './AuthModal'

export default function UserNav() {
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    setUser(AuthService.getCurrentUser())
  }, [])

  const handleAuthSuccess = () => {
    setUser(AuthService.getCurrentUser())
  }

  const handleSignOut = () => {
    AuthService.signOut()
    setUser(null)
    setShowUserMenu(false)
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'early_access': return 'linear-gradient(135deg, #ff6b6b, #feca57)'
      case 'collectors_club': return 'linear-gradient(135deg, #667eea, #764ba2)'
      default: return 'linear-gradient(135deg, var(--accent-teal), var(--accent-lilac))'
    }
  }

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'early_access': return 'Early Access'
      case 'collectors_club': return "Collector's Club"
      default: return 'Collector'
    }
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="luxury-btn grad"
          style={{
            padding: '10px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-gold))',
            color: '#0b0b0f',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '40px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          👤 Sign In
        </button>
        
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '999px',
          border: '2px solid var(--line)',
          background: '#fff',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-teal)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--line)'}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: getTierBadgeColor(user.tier),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'white'
        }}>
          {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>
            {user.name || 'Collector'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
            {getTierName(user.tier)}
          </div>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>▼</span>
      </button>

      {showUserMenu && (
        <div className="luxury-card accent-teal" style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          minWidth: '220px',
          padding: '16px',
          zIndex: 1000,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}>
          <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)' }}>
              {user.name || user.email}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              {user.email}
            </div>
            <div style={{
              display: 'inline-block',
              marginTop: '4px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: getTierBadgeColor(user.tier),
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 600
            }}>
              {getTierName(user.tier)}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a 
              href="/account/wishlist"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px', 
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--ink)',
                fontSize: '0.9rem',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(94,208,192,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ❤️ Wishlist ({user.wishlist.length})
            </a>
            <a 
              href="/account/alerts"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px', 
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--ink)',
                fontSize: '0.9rem',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(94,208,192,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              🔔 Alerts ({user.alerts.filter(a => a.is_active).length})
            </a>
            <a 
              href="/account/collection"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px', 
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--ink)',
                fontSize: '0.9rem',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(94,208,192,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              📸 My Collection
            </a>
            <a 
              href="/drops/calendar"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px', 
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--ink)',
                fontSize: '0.9rem',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(94,208,192,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              📅 Drop Calendar
            </a>
            <div style={{ height: '1px', background: 'var(--line)', margin: '8px 0' }} />
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                borderRadius: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,0,0,0.1)'
                e.currentTarget.style.color = '#dc3545'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--muted)'
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showUserMenu && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999
          }}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}