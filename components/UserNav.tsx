'use client'

import { useState, useEffect } from 'react'
import { authService, AuthUser } from '../lib/auth-new'
import AuthLightModal from './AuthLightModal'
import HeaderActionButton from './ui/HeaderActionButton'

export default function UserNav() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((newUser) => {
      setUser(newUser)
    })
    
    // Initialize auth
    authService.initialize()
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])
  
  // Also check current user on every render as fallback
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser && !user) {
      setUser(currentUser)
    }
  })

  const handleSignOut = async () => {
    await authService.signOut()
    setShowUserMenu(false)
  }

  if (!user) {
    return (
      <>
        <HeaderActionButton
          onClick={() => setShowAuthModal(true)}
          aria-label="Sign in"
          variant="ghost"
        >
          <svg className="shrink-0 w-4 h-4 md:w-[18px] md:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span className="hidden sm:inline">Sign In</span>
        </HeaderActionButton>
        
        <AuthLightModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false)
            // The authService will notify listeners, so user state will update automatically
          }}
        />
      </>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <HeaderActionButton
        onClick={() => setShowUserMenu(!showUserMenu)}
        aria-expanded={showUserMenu}
        aria-haspopup="menu"
        aria-label={`User menu for ${user.name || user.email}`}
        variant="ghost"
      >
        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-r from-teal-400 to-purple-400 flex items-center justify-center text-white text-xs font-semibold shrink-0">
          {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
        </div>
        <span className="hidden sm:inline truncate max-w-20">
          {user.name || 'Account'}
        </span>
      </HeaderActionButton>

      {showUserMenu && (
        <div 
          className="luxury-card accent-teal" 
          role="menu"
          aria-labelledby="user-menu-button"
          style={{
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
              role="menuitem"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px', 
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--ink)',
                fontSize: '0.9rem',
                transition: 'background 0.2s ease',
                minHeight: '44px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(94,208,192,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ❤️ My Wishlist
            </a>
            <a 
              href="/account"
              role="menuitem"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px', 
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'var(--ink)',
                fontSize: '0.9rem',
                transition: 'background 0.2s ease',
                minHeight: '44px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(94,208,192,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ⚙️ Account
            </a>
            {/* Admin Dashboard Link - Only show if user has admin role */}
            {user.roles?.includes('admin') && (
              <a 
                href="/admin/dashboard"
                role="menuitem"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px', 
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--ink)',
                  fontSize: '0.9rem',
                  transition: 'background 0.2s ease',
                  minHeight: '44px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                🛡️ Admin Dashboard
              </a>
            )}
            <div style={{ height: '1px', background: 'var(--line)', margin: '8px 0' }} />
            <button
              onClick={handleSignOut}
              role="menuitem"
              aria-label="Sign out of your account"
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
                textAlign: 'left',
                minHeight: '44px'
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