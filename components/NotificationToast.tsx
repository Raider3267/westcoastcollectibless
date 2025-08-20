'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface NotificationToastProps {
  isOpen: boolean
  onClose: () => void
  message: string
  type?: 'success' | 'error' | 'info'
}

export default function NotificationToast({ 
  isOpen, 
  onClose, 
  message,
  type = 'success'
}: NotificationToastProps) {
  
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000) // Auto-close after 3 seconds
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'info': return 'ℹ️'
      default: return '✅'
    }
  }

  const getBackground = () => {
    switch (type) {
      case 'success': return 'linear-gradient(135deg, #10b981, #059669)'
      case 'error': return 'linear-gradient(135deg, #ef4444, #dc2626)'
      case 'info': return 'linear-gradient(135deg, #3b82f6, #2563eb)'
      default: return 'linear-gradient(135deg, #10b981, #059669)'
    }
  }

  const toastContent = (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000000,
      animation: 'slideInRight 0.3s ease-out'
    }}>
      <div style={{
        background: getBackground(),
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        maxWidth: '500px'
      }}>
        <span style={{ fontSize: '1.5rem' }}>{getIcon()}</span>
        <p style={{ 
          margin: 0, 
          fontSize: '0.95rem',
          fontWeight: 500,
          lineHeight: 1.4
        }}>
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '1.2rem',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          ×
        </button>
      </div>
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(toastContent, document.body)
  }

  return toastContent
}