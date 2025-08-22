import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToCloudinary, validateCloudinaryConfig, FOLDERS } from '../../../../lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    // Validate Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      return NextResponse.json({ 
        error: 'Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.' 
      }, { status: 500 })
    }

    const data = await request.formData()
    const files: File[] = data.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
      }

      try {
        // Convert file to buffer for Cloudinary upload
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Create a data URI for Cloudinary upload
        const mimeType = file.type
        const base64 = buffer.toString('base64')
        const dataUri = `data:${mimeType};base64,${base64}`

        // Generate unique public_id
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const fileNameWithoutExt = file.name.split('.')[0]
        const publicId = `${fileNameWithoutExt}_${timestamp}_${randomSuffix}`

        // Upload to Cloudinary
        const result = await uploadImageToCloudinary(dataUri, {
          folder: FOLDERS.PRODUCTS,
          public_id: publicId,
          resource_type: 'image' as const,
          quality: 'auto:good',
          fetch_format: 'auto'
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
        return NextResponse.json({ 
          error: `Failed to upload ${file.name}: ${uploadError}` 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s) to Cloudinary`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload files' 
    }, { status: 500 })
  }
}