'use client'

import { useState } from 'react'

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setResult(null)
    }
  }

  const testDirectUpload = async () => {
    if (!file) return

    setUploading(true)
    setError('')
    setResult(null)

    try {
      console.log('Testing direct upload to /api/admin/upload')
      
      const formData = new FormData()
      formData.append('files', file)

      console.log('FormData created:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const responseText = await response.text()
      console.log('Raw response text:', responseText)

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        responseData = { rawResponse: responseText }
      }

      if (response.ok) {
        setResult(responseData)
        console.log('✅ Upload successful:', responseData)
      } else {
        setError(`Upload failed: ${response.status} - ${JSON.stringify(responseData)}`)
        console.error('❌ Upload failed:', responseData)
      }

    } catch (error) {
      console.error('❌ Network/fetch error:', error)
      setError(`Network error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setUploading(false)
    }
  }

  const testUploadTest = async () => {
    if (!file) return

    setUploading(true)
    setError('')
    setResult(null)

    try {
      console.log('Testing upload-test endpoint')
      
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch('/api/admin/upload-test', {
        method: 'POST',
        body: formData
      })

      const responseData = await response.json()

      if (response.ok) {
        setResult(responseData)
        console.log('✅ Upload test successful:', responseData)
      } else {
        setError(`Upload test failed: ${response.status} - ${JSON.stringify(responseData)}`)
        console.error('❌ Upload test failed:', responseData)
      }

    } catch (error) {
      console.error('❌ Upload test error:', error)
      setError(`Upload test error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Upload Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Test Image</h2>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {file && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p><strong>File:</strong> {file.name}</p>
              <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>Type:</strong> {file.type}</p>
            </div>
          )}
        </div>

        {file && (
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Options</h2>
            
            <div className="space-y-4">
              <button
                onClick={testUploadTest}
                disabled={uploading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {uploading ? 'Testing...' : '1. Test Upload-Test Endpoint (No Cloudinary)'}
              </button>
              
              <button
                onClick={testDirectUpload}
                disabled={uploading}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
              >
                {uploading ? 'Testing...' : '2. Test Direct Upload (With Cloudinary)'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Success</h3>
            <pre className="text-sm text-green-700 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">📝 Instructions</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Select a small test image (under 1MB)</li>
            <li>2. First try "Test Upload-Test" - this should always work</li>
            <li>3. Then try "Test Direct Upload" - this tests Cloudinary</li>
            <li>4. Check browser console (F12) for detailed logs</li>
            <li>5. Report which test works and which fails</li>
          </ol>
        </div>
      </div>
    </div>
  )
}