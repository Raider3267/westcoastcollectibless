'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  targetDate: Date
  onComplete?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const difference = target - now

      if (difference <= 0) {
        setIsComplete(true)
        onComplete?.()
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  if (isComplete) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
        borderRadius: '999px',
        color: 'white',
        fontWeight: 700,
        fontSize: '1.1rem',
        boxShadow: '0 8px 24px rgba(76,175,80,.3)'
      }}>
        🎉 Drop is now LIVE!
      </div>
    )
  }

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: '60px'
    }}>
      <div style={{
        fontSize: '1.8rem',
        fontWeight: 800,
        color: 'white',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        lineHeight: 1
      }}>
        {value.toString().padStart(2, '0')}
      </div>
      <div style={{
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: 600
      }}>
        {label}
      </div>
    </div>
  )

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '16px 24px',
      background: 'linear-gradient(135deg, var(--wcc-lilac), var(--wcc-teal))',
      borderRadius: '999px',
      color: 'white',
      fontWeight: 700,
      fontSize: '1.1rem',
      marginBottom: '40px',
      boxShadow: '0 8px 24px rgba(199,163,255,.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        animation: 'shimmer 3s infinite'
      }} />
      
      <span style={{ marginRight: '8px' }}>⏰</span>
      
      <TimeUnit value={timeLeft.days} label="days" />
      <span style={{ fontSize: '1.5rem', margin: '0 4px' }}>:</span>
      <TimeUnit value={timeLeft.hours} label="hrs" />
      <span style={{ fontSize: '1.5rem', margin: '0 4px' }}>:</span>
      <TimeUnit value={timeLeft.minutes} label="min" />
      <span style={{ fontSize: '1.5rem', margin: '0 4px' }}>:</span>
      <TimeUnit value={timeLeft.seconds} label="sec" />
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}