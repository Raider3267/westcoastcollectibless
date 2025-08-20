'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AuthService } from '../lib/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: () => void
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        await AuthService.signUp(email, password, name)
      } else {
        await AuthService.signIn(email, password)
      }
      
      onAuthSuccess()
      onClose()
      setEmail('')
      setPassword('')
      setName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestSignIn = async () => {
    setError('')
    setLoading(true)
    
    try {
      // Use predefined guest credentials
      await AuthService.signIn('guest@westcoastcollectibles.com', 'guest123')
      onAuthSuccess()
      onClose()
    } catch (err) {
      setError('Guest sign-in failed. Please try regular sign-in.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError('')
  }

  const modalContent = (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 999999,
      overflowY: 'auto'
    }}>
      <div className="luxury-card accent-teal" style={{ 
        maxWidth: '400px', 
        width: '100%',
        padding: '32px',
        position: 'relative',
        margin: 'auto',
        maxHeight: '90vh',
        overflowY: 'auto',
        zIndex: 999999,
        background: 'white'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--muted)'
          }}
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '1.6rem', 
            fontWeight: 800, 
            color: 'var(--ink)', 
            marginBottom: '8px' 
          }}>
            {mode === 'signin' ? 'Welcome Back!' : 'Join the Collectors'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {mode === 'signin' 
              ? 'Sign in to access your wishlist, saved items and price alerts'
              : 'Create an account to save your favorite collectibles to your wishlist and get early access drops'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.9rem', 
                fontWeight: 600, 
                color: 'var(--ink)', 
                marginBottom: '6px' 
              }}>
                Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid var(--line)',
                  fontSize: '1rem',
                  background: '#fff',
                  color: 'var(--ink)',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-teal)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
              />
            </div>
          )}

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              color: 'var(--ink)', 
              marginBottom: '6px' 
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collector@example.com"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid var(--line)',
                fontSize: '1rem',
                background: '#fff',
                color: 'var(--ink)',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-teal)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              color: 'var(--ink)', 
              marginBottom: '6px' 
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid var(--line)',
                fontSize: '1rem',
                background: '#fff',
                color: 'var(--ink)',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-teal)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              background: '#fee', 
              border: '1px solid #fcc',
              color: '#c33',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="luxury-btn grad"
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '999px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-gold))',
              color: '#0b0b0f',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease',
              minHeight: '48px'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {mode === 'signup' && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(199,163,255,.08), rgba(94,208,192,.08))',
            borderRadius: '12px',
            border: '1px solid var(--line)'
          }}>
            <h4 style={{ 
              fontSize: '0.95rem', 
              fontWeight: 700, 
              color: 'var(--ink)', 
              marginBottom: '8px' 
            }}>
              ✨ Member Benefits
            </h4>
            <ul style={{ 
              fontSize: '0.85rem', 
              color: 'var(--muted)', 
              margin: 0, 
              paddingLeft: '20px',
              lineHeight: '1.6'
            }}>
              <li>❤️ Save items to your wishlist</li>
              <li>🔔 Get notified when items restock</li>
              <li>⚡ Early access to new drops</li>
              <li>📸 Track your collection</li>
            </ul>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={switchMode}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-teal)',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
          
          {mode === 'signin' && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                margin: '16px 0'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
              </div>
              
              <button
                onClick={handleGuestSignIn}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  borderRadius: '999px',
                  border: '2px solid var(--line)',
                  background: 'white',
                  color: 'var(--ink)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = 'var(--accent-teal)'
                    e.currentTarget.style.background = 'rgba(94,208,192,0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = 'var(--line)'
                    e.currentTarget.style.background = 'white'
                  }
                }}
              >
                🎮 Continue as Guest
              </button>
              
              <p style={{ 
                fontSize: '0.75rem', 
                color: 'var(--muted)', 
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                Test the experience with limited features
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Use createPortal to render modal at body level
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}