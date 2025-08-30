'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export default function ImageUpload({ 
  images = [], 
  onChange, 
  maxImages = 10,
  className = '' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    // Clear previous messages
    setUploadError(null)
    setUploadSuccess(null)

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      setUploadError('Please select only image files (JPG, PNG, GIF, WebP)')
      return
    }

    if (images.length + imageFiles.length > maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more images.`)
      return
    }

    // Check file sizes (limit to 10MB per file)
    const oversizedFiles = imageFiles.filter(file => file.size > 10 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setUploadError(`Some files are too large. Maximum file size is 10MB. Please compress your images and try again.`)
      return
    }

    await uploadFiles(imageFiles)
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    setUploadError(null)
    setUploadSuccess(null)
    
    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        const newImagePaths = result.files.map((file: any) => file.path)
        onChange([...images, ...newImagePaths])
        setUploadSuccess(`Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}!`)
        
        // Clear success message after 5 seconds
        setTimeout(() => setUploadSuccess(null), 5000)
      } else {
        // Handle different error types
        if (response.status === 401) {
          setUploadError('Authentication required. Please log in to the admin dashboard first.')
        } else if (response.status === 403) {
          setUploadError('Access denied. You need admin privileges to upload images.')
        } else if (response.status === 413) {
          setUploadError('Files too large. Please compress your images and try again.')
        } else {
          setUploadError(result.error || 'Failed to upload images. Please try again.')
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      if (error instanceof Error) {
        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
          setUploadError('Network error. Please check your internet connection and try again.')
        } else {
          setUploadError(`Upload failed: ${error.message}`)
        }
      } else {
        setUploadError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Product Images ({images.length}/{maxImages})
      </label>
      
      {/* Error Message */}
      {uploadError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-500 text-xl mr-3">⚠️</div>
            <div className="text-red-700 text-sm">{uploadError}</div>
            <button
              onClick={() => setUploadError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-green-500 text-xl mr-3">✅</div>
            <div className="text-green-700 text-sm">{uploadSuccess}</div>
            <button
              onClick={() => setUploadSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700"
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-pop-purple bg-pop-purple/5' 
            : uploadError
            ? 'border-red-300 bg-red-50/20'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pop-purple"></div>
            <span className="text-gray-600">Uploading images...</span>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-2">📸</div>
            <p className="text-gray-600 mb-2">
              Drag & drop images here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-pop-purple hover:text-pop-purple/80 font-medium"
              >
                browse files
              </button>
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, GIF, WebP (Max {maxImages} images, 10MB per file)
            </p>
            {uploadError && (
              <p className="text-xs text-red-500 mt-2">
                Please fix the error above and try again.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.startsWith('http') ? image : `${window.location.origin}${image}`}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNjRMMTI1IDM5SDc1TDEwMCA2NFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHN0eWxlPi5jbGFzcy0xIHsgZmlsbDogbm9uZTsgc3Ryb2tlOiAjOEI5NUEwOyBzdHJva2Utd2lkdGg6IDEuNTsgfTwvc3R5bGU+CjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjkuMjUiIGNsYXNzPSJjbGFzcy0xIi8+CjxwYXRoIGQ9Im0xNSAxNS0zLjg3NS0zLjg3NWE1LjI0IDUuMjQgMCAwIDAgLjg3NS0yLjg3NSA1LjI1IDUuMjUgMCAxIDAtNS4yNSA1LjI1IDUuMjQgNS4yNCAwIDAgMCAyLjg3NS0uODc1TDE1IDE1WiIgY2xhc3M9ImNsYXNzLTEiLz4KPC9zdmc+Cg=='
                    target.alt = 'Image not available'
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  ×
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}