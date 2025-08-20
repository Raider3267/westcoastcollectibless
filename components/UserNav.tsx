'use client'

import { useState, useEffect } from 'react'
import { authService, AuthUser } from '../lib/auth-new'
import AuthLightModal from './AuthLightModal'

export default function UserNav() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribe(setUser)
    
    // Initialize auth
    authService.initialize()
    
    return unsubscribe
  }, [])

  const handleSignOut = async () => {
    await authService.signOut()
    setShowUserMenu(false)
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          style={{
            padding: '10px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(135deg, #5ED0C0, #F7E7C3)',
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
        
        <AuthLightModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
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
          background: 'linear-gradient(135deg, #5ED0C0, #C7A3FF)',
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
            {user.email_verified ? 'Verified' : 'Unverified'}
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
              background: user.email_verified 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 600
            }}>
              {user.email_verified ? 'Verified Member' : 'Unverified'}
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
              ❤️ My Wishlist
            </a>
            <a 
              href="/account"
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
              ⚙️ Account
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