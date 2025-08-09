'use client'

import { useEffect, useState } from 'react'

export default function Confetti() {
  const [confetti, setConfetti] = useState<Array<{
    id: number
    emoji: string
    left: number
    delay: number
    duration: number
  }>>([])

  useEffect(() => {
    const confettiEmojis = ['🎉', '✨', '🎊', '⭐', '💖', '🌟', '🎁', '🎪', '🎭', '🎨', '🧸', '🚀']
    
    const createConfetti = () => {
      const newConfetti = Array.from({ length: 12 }, (_, i) => ({
        id: Math.random(),
        emoji: confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)],
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 4 + Math.random() * 3
      }))
      
      setConfetti(newConfetti)
    }

    createConfetti()
    const interval = setInterval(createConfetti, 10000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {confetti.map((item) => (
        <div
          key={item.id}
          className="absolute text-2xl"
          style={{
            left: `${item.left}%`,
            top: '-50px',
            animation: `confetti-fall ${item.duration}s linear ${item.delay}s forwards`,
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  )
}