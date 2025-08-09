'use client'

import { useEffect } from 'react'

type Product = {
  id: string
  name: string
  price?: number | null
  ebayUrl?: string | null
  image?: string | null
  description?: string | null
}

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  const toyEmojis = ['🧸', '🎨', '🎪', '🎭', '🎲', '🚀', '🌟', '💎', '🎯', '⭐']
  const randomEmoji = toyEmojis[Math.floor(Math.random() * toyEmojis.length)]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border-4 border-pop-pink/20 animate-float">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pop-pink/10 to-pop-orange/10 p-6 border-b-2 border-pop-teal/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-pop-purple mb-2 pr-8">
                {product.name}
              </h2>
              {product.price && (
                <div className="text-3xl font-extrabold text-pop-orange">
                  💰 {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(product.price)}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-4xl hover:text-pop-pink transition-colors duration-200 animate-pulse"
              aria-label="Close modal"
            >
              {randomEmoji}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image */}
          {product.image && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-pop-teal mb-3 flex items-center gap-2">
                📝 Description
              </h3>
              <div className="bg-gradient-to-br from-pop-blue/5 to-pop-purple/5 rounded-2xl p-6 border-l-4 border-pop-teal">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base space-y-2">
                  {product.description?.split('\n').map((line, index) => (
                    <div key={index} className={line.trim().startsWith('•') || line.trim().startsWith('🎁') || line.trim().startsWith('✅') || line.trim().startsWith('🐰') || line.trim().startsWith('✨') || line.trim().startsWith('💰') ? 'ml-2' : ''}>
                      {line.trim() === '' ? <br /> : line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {product.ebayUrl && (
              <a
                href={product.ebayUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center rounded-full px-6 py-4 font-bold text-lg transition-all duration-300 transform hover:scale-105 
                          bg-gradient-to-r from-pop-teal to-pop-blue text-white shadow-lg hover:shadow-xl"
              >
                🏪 View on eBay
              </a>
            )}
            <button
              onClick={onClose}
              className="px-6 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105
                        bg-gradient-to-r from-pop-lime to-pop-yellow text-white shadow-lg hover:shadow-xl"
            >
              ✨ Close
            </button>
          </div>
        </div>

        {/* Fun decorative elements */}
        <div className="absolute top-4 right-20 text-2xl animate-bounce opacity-50">
          🎪
        </div>
        <div className="absolute bottom-4 left-4 text-2xl animate-spin opacity-30">
          ⭐
        </div>
      </div>
    </div>
  )
}