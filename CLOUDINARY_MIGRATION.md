# Cloudinary Image Migration Guide

This document outlines the complete migration of West Coast Collectibles' product images from local storage to Cloudinary CDN.

## Overview

The migration provides:
- ✅ Reliable CDN delivery with 99.9% uptime
- ✅ Automatic image optimization (WebP, AVIF, compression)
- ✅ Versioned URLs for cache busting
- ✅ Responsive image transformations
- ✅ Zero deployment-related image breakage
- ✅ Comprehensive fallback mechanisms

## Architecture

### File Structure
```
lib/
  cloudinary.ts          # Core Cloudinary integration
scripts/
  migrate-images-to-cloudinary.mjs  # Migration script
  verify-cloudinary-images.mjs      # CI verification
tests/
  cloudinary-images.spec.js         # E2E image tests
image-manifest.json                 # Migration tracking
```

### Key Components

1. **Cloudinary Helper Functions** (`lib/cloudinary.ts`)
   - `getImageUrl()` - Smart URL resolution with fallbacks
   - `getImageUrls()` - Batch processing for arrays
   - `uploadImageToCloudinary()` - Upload with optimization
   - `getPlaceholderUrl()` - Consistent fallback images

2. **Image Manifest** (`image-manifest.json`)
   - Maps original URLs to Cloudinary URLs
   - Tracks image metadata and versions
   - Enables rollback capabilities

3. **Updated Components**
   - `ImageCarousel.tsx` - Uses optimized transformations
   - `ProductCard.tsx` - Proper fallbacks and error handling
   - Upload API route - Direct Cloudinary integration

## Migration Process

### Prerequisites

1. **Cloudinary Account Setup**
   ```bash
   # Sign up at https://cloudinary.com
   # Get credentials from dashboard
   ```

2. **Environment Configuration**
   ```bash
   cp .env.local.example .env.local
   # Add your Cloudinary credentials:
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Step 1: Run Migration Script

```bash
# Install dependencies
pnpm install

# Run the migration (uploads all images to Cloudinary)
pnpm run migrate:images
```

The migration script will:
- Upload all local images from `public/uploads/products/`
- Download and re-upload external images (like i.frg.im)
- Generate versioned Cloudinary URLs
- Create `image-manifest.json` with mappings
- Create placeholder images for fallbacks

### Step 2: Verify Migration

```bash
# Run verification checks
pnpm run verify:images
```

This checks for:
- No remaining local image references in code
- All CSV images have Cloudinary mappings
- Cloudinary URLs are accessible
- No forbidden image patterns

### Step 3: Test Image Loading

```bash
# Run Playwright tests
pnpm run test:images
```

Tests verify:
- All images load with proper dimensions
- Image carousel functionality
- Accessibility (alt text)
- Performance (load times)
- Error handling

### Step 4: Deploy

After all tests pass:
1. Commit changes
2. Deploy to staging
3. Run smoke tests
4. Deploy to production

## Usage Guide

### Adding New Images

**Admin Upload** (Recommended):
```typescript
// Images uploaded through /admin/upload automatically go to Cloudinary
// Returns Cloudinary URLs ready for use
```

**Programmatic Upload**:
```typescript
import { uploadImageToCloudinary, FOLDERS } from '../lib/cloudinary'

const result = await uploadImageToCloudinary(imagePath, {
  folder: FOLDERS.PRODUCTS,
  transformation: [
    { quality: 'auto:good' },
    { fetch_format: 'auto' }
  ]
})

console.log('Cloudinary URL:', result.secure_url)
```

### Using Images in Components

```typescript
import { getImageUrl, getImageUrls, TRANSFORMATIONS } from '../lib/cloudinary'

// Single image with optimization
const optimizedUrl = getImageUrl(product.image, TRANSFORMATIONS.PRODUCT_CARD)

// Multiple images
const galleryUrls = getImageUrls(product.images, TRANSFORMATIONS.PRODUCT_MODAL)

// In JSX
<img src={optimizedUrl} alt={product.name} />
```

### Image Transformations

Available transformations:
- `TRANSFORMATIONS.PRODUCT_CARD` - 400x400, optimized for cards
- `TRANSFORMATIONS.PRODUCT_MODAL` - 800x800, for modal views
- `TRANSFORMATIONS.PRODUCT_THUMBNAIL` - 100x100, for thumbnails
- `TRANSFORMATIONS.HERO_BANNER` - 1200x600, for banners

### CSV Data Format

Images in CSV should use one of these formats:
```csv
# Cloudinary URLs (recommended)
images,"https://res.cloudinary.com/your-cloud/image/upload/v1234/westcoast/products/image1.jpg"

# External URLs (allowed)
images,"https://i.frg.im/example/image.jpg"

# Local paths (will be migrated)
images,"/uploads/products/1234_image.jpg"

# Multiple images (comma-separated)
images,"https://res.cloudinary.com/your-cloud/image/upload/v1234/westcoast/products/image1.jpg, https://res.cloudinary.com/your-cloud/image/upload/v1234/westcoast/products/image2.jpg"
```

## Folder Structure

Cloudinary folders are organized as:
```
westcoast/
  products/
    migrated_1755408423379_7047zn_v1234.jpg
    migrated_1755409492777_sxmmv9_v5678.jpg
  placeholders/
    product-placeholder.svg
  temp/
    (temporary files during migration)
```

## Error Handling

The system includes multiple fallback layers:

1. **Cloudinary URL** - Primary source
2. **Original URL** - Fallback for external images
3. **Placeholder** - Default fallback image
4. **Empty state** - Graceful handling of missing images

```typescript
// Example fallback chain
const imageUrl = getImageUrl(product.image) // Handles all fallbacks automatically
```

## Monitoring and Maintenance

### CI/CD Integration

Add to your deployment pipeline:
```bash
# Verify images before deployment
pnpm run verify:images

# Run image tests
pnpm run test:images
```

### Performance Monitoring

Monitor these metrics:
- Image load times (< 2s target)
- CDN cache hit rates (> 95% target)
- Failed image requests (< 1% target)

### Content Updates

When updating products:
1. Upload new images through admin interface
2. Update CSV with new Cloudinary URLs
3. Run verification script
4. Deploy changes

## Troubleshooting

### Common Issues

**Images not loading:**
```bash
# Check Cloudinary credentials
pnpm run verify:images

# Verify URLs are accessible
curl -I "https://res.cloudinary.com/your-cloud/image/upload/..."
```

**Migration failures:**
```bash
# Check environment variables
echo $CLOUDINARY_CLOUD_NAME

# Re-run migration for specific images
node scripts/migrate-images-to-cloudinary.mjs
```

**Build errors:**
```bash
# Ensure all images use helper functions
pnpm run verify:images

# Check TypeScript compilation
pnpm run build
```

### Rollback Procedure

If issues arise:
1. Check `image-manifest.json` for original URLs
2. Update code to use original URLs temporarily
3. Investigate and fix Cloudinary issues
4. Re-run migration when ready

## Security Considerations

- Cloudinary URLs are public but signed for uploads
- API keys are server-side only
- Upload presets control what can be uploaded
- Folder structure prevents unauthorized access

## Performance Optimizations

- Images are automatically optimized (WebP/AVIF)
- Responsive transformations reduce bandwidth
- CDN caching improves load times globally
- Lazy loading compatible with Next.js Image component

## Support

For issues:
1. Check this documentation
2. Run verification script
3. Review Cloudinary dashboard
4. Check application logs
5. Contact development team

---

**Migration completed successfully!** 🎉

All product images now serve from Cloudinary with:
- Reliable CDN delivery
- Automatic optimization
- Versioned URLs
- Comprehensive testing
- Zero deployment issues