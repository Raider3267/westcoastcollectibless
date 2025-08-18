'use client'

import { useState, useEffect } from 'react'

export default function RecentlySoldBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Mock recent sales data - in a real app, this would come from your sales API
  const recentSales = [
    "🔥 Labubu Crystal Ball just sold in New York",
    "💨 Someone in California just bought Limited Skullpanda",
    "⚡ Staff Pick Hacipupu sold in Texas",
    "🎯 Limited Edition sold in Florida",
    "✨ 3 items sold in the last hour"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recentSales.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [recentSales.length])

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '8px 0',
      textAlign: 'center',
      fontSize: '0.9rem',
      fontWeight: 600,
      position: 'relative',
      overflow: 'hidden',
      minHeight: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
        animation: 'shimmer 3s ease-in-out infinite'
      }} />
      <div style={{ 
        position: 'relative', 
        zIndex: 2,
        transition: 'all 0.5s ease-in-out',
        opacity: 1
      }}>
        {recentSales[currentIndex]}
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}