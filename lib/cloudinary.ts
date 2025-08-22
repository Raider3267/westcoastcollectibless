// Only import cloudinary on server side
let cloudinary: any
if (typeof window === 'undefined') {
  const { v2 } = require('cloudinary')
  cloudinary = v2
  
  // Cloudinary configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  })
}

// Upload preset configurations for different image types
export const UPLOAD_PRESETS = {
  PRODUCT_HERO: 'westcoast_product_hero',
  PRODUCT_GALLERY: 'westcoast_product_gallery',
  PRODUCT_THUMBNAIL: 'westcoast_product_thumbnail'
} as const

// Folder structure for organized asset management
export const FOLDERS = {
  PRODUCTS: 'westcoast/products',
  COLLECTIONS: 'westcoast/collections',
  BRANDS: 'westcoast/brands'
} as const

// Image transformation presets for consistent sizing and optimization
export const TRANSFORMATIONS = {
  PRODUCT_CARD: 'w_400,h_400,c_fill,f_auto,q_auto',
  PRODUCT_MODAL: 'w_800,h_800,c_fill,f_auto,q_auto',
  PRODUCT_THUMBNAIL: 'w_100,h_100,c_fill,f_auto,q_auto',
  HERO_BANNER: 'w_1200,h_600,c_fill,f_auto,q_auto'
} as const

export interface CloudinaryAsset {
  public_id: string
  version: number
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  bytes: number
  type: string
  etag: string
  placeholder: boolean
  url: string
  secure_url: string
  folder: string
  original_filename: string
}

export interface ImageManifestEntry {
  original_url: string
  cloudinary_public_id: string
  cloudinary_url: string
  version: number
  width: number
  height: number
  format: string
  bytes: number
  uploaded_at: string
}

/**
 * Upload an image to Cloudinary with proper folder structure and versioning
 */
export async function uploadImageToCloudinary(
  imagePath: string,
  options: {
    folder?: string
    public_id?: string
    upload_preset?: string
    transformation?: string
  } = {}
): Promise<CloudinaryAsset> {
  try {
    const uploadOptions = {
      folder: options.folder || FOLDERS.PRODUCTS,
      upload_preset: options.upload_preset || UPLOAD_PRESETS.PRODUCT_GALLERY,
      resource_type: 'image' as const,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      ...options
    }

    const result = await cloudinary.uploader.upload(imagePath, uploadOptions)
    return result as CloudinaryAsset
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw new Error(`Failed to upload image: ${error}`)
  }
}

/**
 * Generate optimized Cloudinary URL with transformations
 */
export function getCloudinaryUrl(
  publicId: string,
  transformation: string = TRANSFORMATIONS.PRODUCT_CARD
): string {
  return cloudinary.url(publicId, {
    transformation,
    secure: true,
    sign_url: false
  })
}

/**
 * Get image URL with fallback to external or placeholder
 */
export function getImageUrl(
  imageUrl: string | null | undefined,
  transformation: string = TRANSFORMATIONS.PRODUCT_CARD
): string {
  if (!imageUrl) {
    return getPlaceholderUrl()
  }

  // If it's already a Cloudinary URL, return as-is
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl
  }

  // If it's an external URL (like i.frg.im), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  // If it's a local upload path, try to resolve from manifest
  if (imageUrl.startsWith('/uploads/products/')) {
    const manifestEntry = getImageFromManifest(imageUrl)
    if (manifestEntry) {
      return getCloudinaryUrl(manifestEntry.cloudinary_public_id, transformation)
    }
    
    // Fallback to local URL during migration
    return imageUrl
  }

  // Default fallback
  return getPlaceholderUrl()
}

/**
 * Get multiple image URLs with proper fallbacks
 */
export function getImageUrls(
  images: string[] | undefined,
  transformation: string = TRANSFORMATIONS.PRODUCT_CARD
): string[] {
  if (!images || images.length === 0) {
    return [getPlaceholderUrl()]
  }

  return images.map(img => getImageUrl(img, transformation))
}

/**
 * Generate placeholder image URL
 */
export function getPlaceholderUrl(): string {
  return cloudinary.url('westcoast/placeholders/product-placeholder', {
    transformation: TRANSFORMATIONS.PRODUCT_CARD,
    secure: true
  })
}

/**
 * Get image from manifest by original URL
 */
function getImageFromManifest(originalUrl: string): ImageManifestEntry | null {
  try {
    // This will be populated by the migration script
    // Note: In production, consider using a proper JSON import or API
    if (typeof window === 'undefined') {
      // Server-side
      const fs = require('fs')
      const path = require('path')
      const manifestPath = path.join(process.cwd(), 'image-manifest.json')
      const manifestContent = fs.readFileSync(manifestPath, 'utf-8')
      const manifest = JSON.parse(manifestContent)
      return manifest.images[originalUrl] || null
    } else {
      // Client-side - return null for now, could implement fetch later
      return null
    }
  } catch (error) {
    // Manifest doesn't exist yet or has errors
    return null
  }
}

/**
 * Batch upload images with progress tracking
 */
export async function batchUploadImages(
  imagePaths: string[],
  options: {
    folder?: string
    onProgress?: (completed: number, total: number, current: string) => void
    concurrency?: number
  } = {}
): Promise<CloudinaryAsset[]> {
  const { folder = FOLDERS.PRODUCTS, onProgress, concurrency = 3 } = options
  const results: CloudinaryAsset[] = []
  const total = imagePaths.length

  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < imagePaths.length; i += concurrency) {
    const batch = imagePaths.slice(i, i + concurrency)
    const batchPromises = batch.map(async (imagePath) => {
      try {
        const result = await uploadImageToCloudinary(imagePath, { folder })
        onProgress?.(results.length + 1, total, imagePath)
        return result
      } catch (error) {
        console.error(`Failed to upload ${imagePath}:`, error)
        throw error
      }
    })

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }

  return results
}

/**
 * Validate Cloudinary configuration
 */
export function validateCloudinaryConfig(): boolean {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('Missing Cloudinary environment variables:', missing)
    return false
  }
  
  return true
}

// Only export cloudinary on server side
export { cloudinary }