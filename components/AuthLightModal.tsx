'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { authService } from '../lib/auth-new'

interface AuthLightModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (productId?: string) => void
  productId?: string // If provided, will save this product after auth
  title?: string
  subtitle?: string
}

export default function AuthLightModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  productId,
  title = "Sign up to save",
  subtitle = "Create a free account to build your wishlist and get drop alerts."
}: AuthLightModalProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    marketing_opt_in: true
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        await authService.signUp({
          email: formData.email,
          password: formData.password,
          name: formData.name || undefined,
          marketing_opt_in: formData.marketing_opt_in
        })
      } else {
        await authService.signIn({
          email: formData.email,
          password: formData.password
        })
      }

      // If productId provided, save it to wishlist
      if (productId) {
        try {
          await authService.toggleWishlist(productId)
          // Show success toast
          window.dispatchEvent(new CustomEvent('wishlist-toast', {
            detail: { 
              message: 'Saved to your wishlist — we\'ll keep you posted.',
              type: 'success' 
            }
          }))
        } catch (wishlistError) {
          console.error('Failed to save to wishlist:', wishlistError)
        }
      }

      onSuccess?.(productId)
      onClose()
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        marketing_opt_in: true
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'signup' ? 'signin' : 'signup')
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
      <div style={{ 
        maxWidth: '400px', 
        width: '100%',
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
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
            color: '#666',
            padding: '4px',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#333', 
            marginBottom: '8px' 
          }}>
            {mode === 'signup' ? title : 'Welcome back!'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5 }}>
            {mode === 'signup' ? subtitle : 'Sign in to access your wishlist and alerts.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.9rem', 
                fontWeight: 600, 
                color: '#333', 
                marginBottom: '6px' 
              }}>
                Name (optional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  background: '#fff',
                  color: '#333',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#5ED0C0'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          )}

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              color: '#333', 
              marginBottom: '6px' 
            }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="collector@example.com"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem',
                background: '#fff',
                color: '#333',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#5ED0C0'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: 600, 
              color: '#333', 
              marginBottom: '6px' 
            }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem',
                background: '#fff',
                color: '#333',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#5ED0C0'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {mode === 'signup' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input
                type="checkbox"
                id="marketing-opt-in"
                checked={formData.marketing_opt_in}
                onChange={(e) => setFormData(prev => ({ ...prev, marketing_opt_in: e.target.checked }))}
                style={{ marginTop: '2px' }}
              />
              <label htmlFor="marketing-opt-in" style={{ 
                fontSize: '0.85rem', 
                color: '#666',
                lineHeight: 1.4,
                cursor: 'pointer'
              }}>
                Email me drop alerts and updates.
              </label>
            </div>
          )}

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
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #5ED0C0, #F7E7C3)',
              color: '#0b0b0f',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Processing...' : (mode === 'signup' ? 'Create account' : 'Sign in')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            {mode === 'signup' ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={switchMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#5ED0C0',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              {mode === 'signup' ? 'Sign in instead' : 'Sign up'}
            </button>
          </p>
          
          {mode === 'signup' && (
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#999', 
              marginTop: '12px',
              fontStyle: 'italic'
            }}>
              No spam. Unsubscribe anytime.
            </p>
          )}
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}