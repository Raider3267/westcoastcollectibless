import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToCloudinary, validateCloudinaryConfig, FOLDERS } from '../../../../lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called')
    
    // Validate Cloudinary configuration
    const configValid = validateCloudinaryConfig()
    console.log('Cloudinary config valid:', configValid)
    
    if (!configValid) {
      console.error('Cloudinary config validation failed')
      return NextResponse.json({ 
        error: 'Image upload service is temporarily unavailable. Please try again later.' 
      }, { status: 503 })
    }

    // Check content length to prevent extremely large uploads
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) { // 50MB total limit
      return NextResponse.json({ 
        error: 'Upload too large. Maximum total size is 50MB.' 
      }, { status: 413 })
    }

    const data = await request.formData()
    const files: File[] = data.getAll('files') as File[]
    
    console.log('Files received:', files.length)

    if (!files || files.length === 0) {
      console.error('No files in request')
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    // Limit number of files per request
    if (files.length > 10) {
      return NextResponse.json({ 
        error: 'Too many files. Maximum 10 files per upload.' 
      }, { status: 400 })
    }

    const uploadedFiles = []
    const maxFileSize = 10 * 1024 * 1024 // 10MB per file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

    for (const file of files) {
      console.log('Processing file:', {
        name: file.name,
        type: file.type,
        size: file.size
      })
      
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        console.error('Invalid file type:', file.type)
        return NextResponse.json({ 
          error: `Invalid file type: ${file.type}. Only JPG, PNG, GIF, and WebP images are allowed.` 
        }, { status: 400 })
      }

      if (file.size > maxFileSize) {
        console.error('File too large:', file.size)
        return NextResponse.json({ 
          error: `File '${file.name}' is too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum file size is 10MB.` 
        }, { status: 413 })
      }

      if (file.size === 0) {
        console.error('Empty file:', file.name)
        return NextResponse.json({ 
          error: `File '${file.name}' appears to be empty or corrupted.` 
        }, { status: 400 })
      }

      try {
        // Convert file to buffer for Cloudinary upload
        console.log('Converting file to buffer...')
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Create a data URI for Cloudinary upload
        const mimeType = file.type
        const base64 = buffer.toString('base64')
        const dataUri = `data:${mimeType};base64,${base64}`
        console.log('Data URI created, size:', dataUri.length)

        // Generate unique public_id with sanitization
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const fileNameWithoutExt = file.name
          .split('.')[0]
          .replace(/[^a-zA-Z0-9-_]/g, '_') // Sanitize filename
          .substring(0, 50) // Limit length
        const publicId = `${fileNameWithoutExt}_${timestamp}_${randomSuffix}`
        console.log('Generated public_id:', publicId)

        // Upload to Cloudinary (remove upload_preset to avoid conflicts)
        const result = await uploadImageToCloudinary(dataUri, {
          folder: FOLDERS.PRODUCTS,
          public_id: publicId,
          upload_preset: undefined // Don't use upload preset for admin uploads
        })

        uploadedFiles.push({
          filename: file.name,
          path: result.secure_url,
          cloudinary_public_id: result.public_id,
          cloudinary_url: result.secure_url,
          size: file.size,
          width: result.width,
          height: result.height,
          format: result.format
        })

        console.log(`✅ Uploaded ${file.name} to Cloudinary: ${result.secure_url}`)

      } catch (uploadError) {
        console.error(`Failed to upload ${file.name}:`, uploadError)
        const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError)
        
        // Don't expose internal error details to client
        if (errorMessage.includes('Invalid image file') || errorMessage.includes('Unsupported file format')) {
          return NextResponse.json({ 
            error: `File '${file.name}' is not a valid image or is corrupted. Please try a different file.` 
          }, { status: 400 })
        } else if (errorMessage.includes('File size too large') || errorMessage.includes('Request entity too large')) {
          return NextResponse.json({ 
            error: `File '${file.name}' is too large. Please compress the image and try again.` 
          }, { status: 413 })
        } else {
          return NextResponse.json({ 
            error: `Failed to upload '${file.name}'. Please try again.` 
          }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s) to Cloudinary`
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    // Handle different types of errors gracefully
    if (error instanceof Error) {
      if (error.message.includes('PayloadTooLarge') || error.message.includes('Request entity too large')) {
        return NextResponse.json({ 
          error: 'Upload too large. Please reduce file sizes and try again.' 
        }, { status: 413 })
      } else if (error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Upload timeout. Please try again with smaller files or check your connection.' 
        }, { status: 408 })
      }
    }
    
    return NextResponse.json({ 
      error: 'An unexpected error occurred during upload. Please try again.' 
    }, { status: 500 })
  }
}