'use client'

import { useState } from 'react'

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

  // Filter out broken images
  const validImages = images.filter((_, index) => !imageError.has(index))
  const currentImage = validImages[currentIndex] || images[0]

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
      <div className={`relative ${className}`}>
        <img
          src={currentImage}
          alt={productName}
          className={`w-full object-cover rounded-lg ${autoHeight ? 'h-auto' : 'aspect-square'}`}
          onError={() => handleImageError(0)}
        />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={currentImage}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className={`w-full object-cover transition-opacity duration-300 ${autoHeight ? 'h-auto' : 'aspect-square'}`}
          onError={() => handleImageError(currentIndex)}
        />
        
        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}

        {/* Image Counter */}
        {validImages.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1}/{validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && validImages.length > 1 && validImages.length <= 6 && (
        <div className="flex gap-2 mt-2 justify-center">
          {validImages.map((image, index) => (
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
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
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