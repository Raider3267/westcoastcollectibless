'use client'

import { useState } from 'react'
import ProductModal from './ProductModal'
import DetailsButton from './DetailsButton'

type Product = {
  id: string
  name: string
  price?: number | null
  ebayUrl?: string | null
  image?: string | null
  description?: string | null
}

interface ProductCardProps {
  product: Product
  cardColor: string
  randomEmoji: string
}

export default function ProductCard({ product, cardColor, randomEmoji }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const isStripe = Boolean(product.stripeLink)

  return (
    <>
      <article 
        className={`group rounded-3xl border-2 bg-gradient-to-br ${cardColor} backdrop-blur-sm 
                   shadow-lg overflow-hidden transition-all duration-300 
                   hover:shadow-2xl hover:scale-105 hover:-rotate-1 
                   transform hover:border-pop-pink/50 relative`}
      >
        {/* Fun decorative elements */}
        <div className="absolute top-2 right-2 text-2xl group-hover:animate-spin">
          {randomEmoji}
        </div>
        
        {/* Image */}
        <div className="aspect-square bg-gradient-to-br from-white/50 to-gray-100/50 grid place-items-center relative overflow-hidden">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" 
              loading="lazy" 
            />
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-2">{randomEmoji}</div>
              <span className="text-sm text-gray-500 font-medium">Surprise Inside!</span>
            </div>
          )}
          {/* Sparkle effect overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                         bg-gradient-to-t from-transparent via-transparent to-white/20"></div>
        </div>

        {/* Content */}
        <div className="p-5 bg-white/90 backdrop-blur-sm">
          <h3 className="text-lg font-bold leading-tight line-clamp-2 text-gray-800 group-hover:text-pop-purple transition-colors">
            {product.name}
          </h3>
          {product.description ? (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
          ) : null}
          {typeof product.price === 'number' ? (
            <div className="mt-3 text-xl font-extrabold text-pop-orange">
              💰 {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(product.price)}
            </div>
          ) : null}

          <div className="mt-4 flex gap-2">
            <a
              href={product.ebayUrl || 'https://www.ebay.com/usr/westcoastcollectibless'}
              target="_blank"
              rel="noreferrer"
              className={`flex-1 text-center rounded-full px-4 py-3 font-bold text-sm transition-all duration-300 transform hover:scale-105 
                         ${isStripe 
                           ? 'bg-gradient-to-r from-pop-pink to-pop-orange text-white shadow-lg hover:shadow-xl' 
                           : 'bg-gradient-to-r from-pop-teal to-pop-blue text-white shadow-lg hover:shadow-xl'}`}
            >
              {isStripe ? '🛒 Buy Now!' : '🏪 View on eBay'}
            </a>
            <DetailsButton onClick={() => setIsModalOpen(true)} />
          </div>
        </div>
      </article>

      <ProductModal 
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}