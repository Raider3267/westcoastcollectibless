# Image Upload Troubleshooting Guide

## Overview
This guide helps troubleshoot common issues with image uploads in the West Coast Collectibles admin dashboard.

## Common Issues and Solutions

### 1. Authentication Required Error

**Error Message:** "Authentication required"

**Cause:** You're not properly logged into the admin dashboard.

**Solution:**
1. Go to `/admin-bypass` in your browser
2. Enter the admin password: `westcoast2025admin`
3. This will set the necessary authentication cookies
4. Navigate back to `/admin/dashboard`
5. Try uploading images again

### 2. Upload Fails with 401/403 Error

**Error Message:** "Access denied" or "Authentication required"

**Cause:** Your admin session has expired or cookies were cleared.

**Solution:**
1. Log out of the admin dashboard
2. Clear your browser cookies for this site
3. Log back in through `/admin-bypass`
4. Try uploading again

### 3. Files Too Large Error

**Error Message:** "Files too large" or "File is too large"

**Cause:** Image files exceed the size limits.

**Limits:**
- Maximum per file: 10MB
- Maximum total upload: 50MB
- Maximum files per request: 10

**Solution:**
1. Compress your images using tools like:
   - TinyPNG (https://tinypng.com/)
   - Squoosh (https://squoosh.app/)
   - ImageOptim (Mac)
   - GIMP or Photoshop
2. Reduce image dimensions if needed
3. Convert to more efficient formats (WebP, optimized JPEG)

### 4. Invalid File Type Error

**Error Message:** "Invalid file type" or "Only JPG, PNG, GIF, and WebP images are allowed"

**Supported Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**Solution:**
1. Convert unsupported formats using image editing software
2. Ensure file extensions match the actual format
3. Avoid corrupted or partially downloaded images

### 5. Network or Connection Errors

**Error Messages:**
- "Network error. Please check your internet connection"
- "Upload timeout"
- "An unexpected error occurred"

**Solutions:**
1. Check your internet connection
2. Try uploading fewer files at once
3. Refresh the page and try again
4. Check if the server is running properly

### 6. Cloudinary Configuration Issues

**Error Message:** "Image upload service is temporarily unavailable"

**Cause:** Cloudinary environment variables are missing or invalid.

**Solution (for developers):**
1. Ensure these environment variables are set in `.env.local`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
2. Verify the cloud name only contains letters, numbers, hyphens, and underscores
3. Restart the development server after changing environment variables

## Best Practices

### File Preparation
1. **Optimize images** before uploading to reduce file sizes
2. **Use descriptive filenames** (they'll be sanitized automatically)
3. **Check image quality** - corrupted files will be rejected
4. **Batch uploads** - upload multiple images at once when possible

### Upload Process
1. **Wait for completion** - don't navigate away during uploads
2. **Check success messages** - green confirmation shows successful uploads
3. **Handle errors gracefully** - read error messages for specific solutions
4. **Try again** if uploads fail - temporary network issues are common

### File Management
1. **Preview images** before finalizing product listings
2. **Remove unused images** to keep storage organized
3. **Use consistent aspect ratios** for better product displays
4. **Test image loading** on the public site after uploads

## Technical Details

### Upload Flow
1. Files are validated on the client (type, size, count)
2. FormData is sent to `/api/admin/upload`
3. Server validates authentication and file properties
4. Images are uploaded to Cloudinary
5. URLs are returned and added to the product

### Error Handling
- Client-side validation prevents many issues
- Server-side validation provides security
- Detailed error messages help with troubleshooting
- Automatic retry logic handles temporary failures

### Security Features
- Authentication required for all uploads
- File type validation (whitelist approach)
- File size limits prevent abuse
- Filename sanitization prevents attacks
- Error message sanitization prevents information disclosure

## Testing

Run the diagnostic script to test the upload system:

```bash
node scripts/test-image-upload.mjs
```

This will:
- Validate Cloudinary configuration
- Test direct Cloudinary uploads
- Test the upload API endpoint
- Check component integration

## Getting Help

If you continue to have issues:

1. **Check the browser console** for detailed error messages
2. **Try the diagnostic script** to isolate the problem
3. **Verify authentication** by logging out and back in
4. **Contact support** with specific error messages and steps to reproduce

## Environment Setup for Developers

### Required Environment Variables
```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Admin Authentication
ADMIN_EMAILS=your_admin_email@domain.com
```

### Development Server
```bash
npm run dev
```

### Production Deployment
Ensure all environment variables are properly set in your Vercel dashboard or deployment platform.

---

*Last updated: August 2025*