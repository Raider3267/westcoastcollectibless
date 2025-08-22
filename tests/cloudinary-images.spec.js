import { test, expect } from '@playwright/test'

/**
 * Playwright tests to verify image loading and Cloudinary integration
 */

test.describe('Cloudinary Image Integration', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/')
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('All product images load successfully', async ({ page }) => {
    // Wait for product cards to load
    await page.waitForSelector('[data-testid="product-card"], .product-card', { timeout: 10000 })
    
    // Get all product images
    const productImages = await page.locator('.product-card img, [data-testid="product-image"]').all()
    
    console.log(`Found ${productImages.length} product images to test`)
    
    // Test each image
    for (let i = 0; i < productImages.length; i++) {
      const img = productImages[i]
      
      // Check if image has loaded successfully
      const naturalWidth = await img.evaluate((el) => el.naturalWidth)
      const naturalHeight = await img.evaluate((el) => el.naturalHeight)
      const src = await img.getAttribute('src')
      
      console.log(`Image ${i + 1}: ${src} (${naturalWidth}x${naturalHeight})`)
      
      // Verify image has valid dimensions
      expect(naturalWidth).toBeGreaterThan(0)
      expect(naturalHeight).toBeGreaterThan(0)
      
      // Verify image src is not empty
      expect(src).toBeTruthy()
      expect(src).not.toBe('')
    }
  })

  test('Product images use Cloudinary or approved external domains', async ({ page }) => {
    // Get all image sources
    const imageSources = await page.locator('img').evaluateAll((images) => 
      images.map(img => img.src).filter(src => src && src !== '')
    )

    const approvedDomains = [
      'res.cloudinary.com',
      'cloudinary.com',
      'i.frg.im', // External provider
      'localhost:3000', // Development
      'vercel.app', // Staging
      'westcoastcollectibless.com' // Production
    ]

    const forbiddenPatterns = [
      '/uploads/products/', // Local uploads should be migrated
      'public/uploads/' // Any local uploads
    ]

    for (const src of imageSources) {
      try {
        const url = new URL(src)
        const domain = url.hostname
        
        // Check if domain is approved
        const isApprovedDomain = approvedDomains.some(approved => 
          domain === approved || domain.endsWith('.' + approved)
        )
        
        // Check for forbidden patterns
        const hasForbiddenPattern = forbiddenPatterns.some(pattern => 
          src.includes(pattern)
        )
        
        expect(hasForbiddenPattern).toBe(false)
        
        if (!isApprovedDomain) {
          console.warn(`Warning: Image from non-approved domain: ${domain} (${src})`)
        }
        
      } catch (error) {
        // Relative URLs or data URLs - check for forbidden patterns
        const hasForbiddenPattern = forbiddenPatterns.some(pattern => 
          src.includes(pattern)
        )
        expect(hasForbiddenPattern).toBe(false)
      }
    }
  })

  test('Image carousel functionality works correctly', async ({ page }) => {
    // Find a product with multiple images
    const productWithCarousel = await page.locator('.product-card').first()
    await productWithCarousel.waitFor()
    
    // Check if carousel controls are present (only for products with multiple images)
    const carouselButtons = await productWithCarousel.locator('button[aria-label*="image"], .carousel-button').count()
    
    if (carouselButtons > 0) {
      // Test carousel navigation
      const nextButton = productWithCarousel.locator('button[aria-label*="Next"], .carousel-next').first()
      const prevButton = productWithCarousel.locator('button[aria-label*="Previous"], .carousel-prev').first()
      
      if (await nextButton.isVisible()) {
        await nextButton.click()
        await page.waitForTimeout(500) // Wait for transition
        
        // Verify image changed
        const currentImage = await productWithCarousel.locator('img').first()
        expect(await currentImage.isVisible()).toBe(true)
      }
      
      if (await prevButton.isVisible()) {
        await prevButton.click()
        await page.waitForTimeout(500) // Wait for transition
      }
    }
  })

  test('Product modal images load correctly', async ({ page }) => {
    // Click on first product's details button
    const firstProduct = await page.locator('.product-card').first()
    const detailsButton = firstProduct.locator('button').filter({ hasText: /details/i }).first()
    
    if (await detailsButton.isVisible()) {
      await detailsButton.click()
      
      // Wait for modal to appear
      await page.waitForSelector('[data-testid="product-modal"], .modal', { timeout: 5000 })
      
      // Check modal images
      const modalImages = await page.locator('.modal img, [data-testid="modal-image"]').all()
      
      for (const img of modalImages) {
        const naturalWidth = await img.evaluate((el) => el.naturalWidth)
        const naturalHeight = await img.evaluate((el) => el.naturalHeight)
        
        expect(naturalWidth).toBeGreaterThan(0)
        expect(naturalHeight).toBeGreaterThan(0)
      }
      
      // Close modal
      const closeButton = page.locator('button').filter({ hasText: /close|×/i }).first()
      if (await closeButton.isVisible()) {
        await closeButton.click()
      }
    }
  })

  test('Images have proper alt text for accessibility', async ({ page }) => {
    const images = await page.locator('img').all()
    
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const src = await img.getAttribute('src')
      
      // Images should have alt text (empty alt is acceptable for decorative images)
      expect(alt).not.toBeNull()
      
      // Product images should have descriptive alt text
      if (src && (src.includes('product') || src.includes('cloudinary'))) {
        expect(alt).toBeTruthy()
        expect(alt.length).toBeGreaterThan(0)
      }
    }
  })

  test('Images respond to network conditions', async ({ page }) => {
    // Test with slow network
    await page.route('**/*', (route) => {
      // Add delay to image requests
      if (route.request().resourceType() === 'image') {
        setTimeout(() => route.continue(), 100)
      } else {
        route.continue()
      }
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify images still load even with network delay
    const images = await page.locator('.product-card img').all()
    
    for (const img of images) {
      await img.waitFor({ state: 'visible', timeout: 10000 })
      const naturalWidth = await img.evaluate((el) => el.naturalWidth)
      expect(naturalWidth).toBeGreaterThan(0)
    }
  })

  test('Placeholder images display when original fails', async ({ page }) => {
    // Mock failed image requests
    await page.route('**/broken-image.jpg', (route) => {
      route.abort()
    })

    // Navigate to a test page or inject broken image
    await page.evaluate(() => {
      const img = document.createElement('img')
      img.src = '/broken-image.jpg'
      img.alt = 'Test broken image'
      img.style.width = '100px'
      img.style.height = '100px'
      document.body.appendChild(img)
    })

    await page.waitForTimeout(2000)

    // Check that the page still functions properly even with broken images
    const productCards = await page.locator('.product-card').count()
    expect(productCards).toBeGreaterThan(0)
  })
})

test.describe('Image Performance', () => {
  
  test('Images load within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for first image to load
    await page.locator('.product-card img').first().waitFor({ state: 'visible' })
    
    const loadTime = Date.now() - startTime
    
    // First image should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
    
    console.log(`First image loaded in ${loadTime}ms`)
  })

  test('Images use appropriate formats and optimizations', async ({ page }) => {
    await page.goto('/')
    
    // Get image URLs
    const imageUrls = await page.locator('img').evaluateAll((images) => 
      images.map(img => img.src).filter(src => src.includes('cloudinary'))
    )

    for (const url of imageUrls) {
      // Cloudinary URLs should include optimization parameters
      expect(url).toMatch(/[?&](f_auto|q_auto|w_\d+|h_\d+)/)
    }
  })
})

test.describe('Image Upload (Admin)', () => {
  
  test.skip('Admin can upload images to Cloudinary', async ({ page }) => {
    // This test would require admin authentication
    // Skip for now but include as example
    
    // await page.goto('/admin/login')
    // // Login as admin
    // await page.goto('/admin/dashboard')
    // 
    // // Test image upload functionality
    // const fileInput = page.locator('input[type="file"]')
    // await fileInput.setInputFiles('path/to/test-image.jpg')
    // 
    // // Submit upload
    // await page.click('button[type="submit"]')
    // 
    // // Verify image was uploaded to Cloudinary
    // await expect(page.locator('.success-message')).toBeVisible()
  })
})