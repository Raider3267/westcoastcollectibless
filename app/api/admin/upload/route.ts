import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const files: File[] = data.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    
    // Create uploads directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    const uploadedFiles = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}_${randomSuffix}.${extension}`
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const filepath = path.join(uploadDir, filename)
      await writeFile(filepath, buffer)
      
      // Store the public URL path
      const publicPath = `/uploads/products/${filename}`
      uploadedFiles.push({
        filename: file.name,
        path: publicPath,
        size: file.size
      })
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload files' 
    }, { status: 500 })
  }
}