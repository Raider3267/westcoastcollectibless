'use client'

import { useState } from 'react'
import { getImageUrls, getImageUrl, TRANSFORMATIONS } from '../lib/cloudinary'

interface ImageCarouselProps {
  images: string[]
  productName: string
  className?: string
  showThumbnails?: boolean
  autoHeight?: boolean
}

export default function ImageCarousel({ 
  images, 
  productName, 
  className = '',
  showThumbnails = true,
  autoHeight = false
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageError, setImageError] = useState<Set<number>>(new Set())

  // Process images through Cloudinary helpers
  const processedImages = getImageUrls(images, TRANSFORMATIONS.PRODUCT_CARD)
  const validImages = processedImages.filter((_, index) => !imageError.has(index))
  const currentImage = validImages[currentIndex] || processedImages[0]
  
  

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const handleImageError = (index: number) => {
    setImageError(prev => new Set([...prev, index]))
  }

  // If no valid images, show placeholder
  if (validImages.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📦</div>
            <span className="text-sm text-gray-500">No Image</span>
          </div>
        </div>
      </div>
    )
  }

  // Single image - no carousel needed
  if (validImages.length === 1) {
    return (
      <div className={`relative group w-full h-full ${className}`}>
        <img
          src={currentImage}
          alt={productName}
          className="wcc-zoom"
          onError={() => handleImageError(0)}
        />
      </div>
    )
  }

  return (
    <div className={`relative group w-full h-full ${className}`}>
      <img
        src={currentImage}
        alt={`${productName} - Image ${currentIndex + 1}`}
        className="wcc-zoom"
        onError={() => handleImageError(currentIndex)}
      />
      
      {/* Small Navigation Arrows for individual cards - positioned inside at edges */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full w-7 h-7 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg z-50 text-sm"
            aria-label="Previous image"
            style={{
              border: '1px solid rgba(0,0,0,0.1)',
              backdropFilter: 'blur(4px)'
            }}
          >
            ←
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full w-7 h-7 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg z-50 text-sm"
            aria-label="Next image"
            style={{
              border: '1px solid rgba(0,0,0,0.1)',
              backdropFilter: 'blur(4px)'
            }}
          >
            →
          </button>
        </>
      )}

      {/* Thumbnail Navigation */}
      {showThumbnails && validImages.length > 1 && validImages.length <= 6 && (
        <div className="flex gap-2 mt-2 justify-center">
          {validImages.map((image, index) => {
            // Use thumbnail transformation for thumbnails
            const thumbnailUrl = getImageUrl(processedImages[index], TRANSFORMATIONS.PRODUCT_THUMBNAIL)
            return (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                  index === currentIndex 
                    ? 'border-pop-purple shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={thumbnailUrl}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                />
              </button>
            )
          })}
        </div>
      )}

      {/* Dot Indicators for many images */}
      {showThumbnails && validImages.length > 6 && (
        <div className="flex gap-1 mt-2 justify-center">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-pop-purple' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}