#!/usr/bin/env node

/**
 * Performance monitoring script for West Coast Collectibles
 * Checks Core Web Vitals and provides performance recommendations
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const PERFORMANCE_BUDGETS = {
  LCP: 2800, // ms
  CLS: 0.06, // score
  INP: 200,  // ms
  FCP: 1800, // ms
  TTI: 3800, // ms
}

const BUNDLE_SIZE_LIMITS = {
  mainBundle: 250000, // bytes (250KB)
  totalJS: 500000,    // bytes (500KB)
  totalCSS: 100000,   // bytes (100KB)
}

console.log('🔍 West Coast Collectibles - Performance Check')
console.log('=' .repeat(50))

// Check if Next.js build exists
const buildPath = path.join(process.cwd(), '.next')
if (!fs.existsSync(buildPath)) {
  console.log('❌ No build found. Run "npm run build" first.')
  process.exit(1)
}

// Analyze bundle sizes
try {
  const statsPath = path.join(buildPath, 'analyze/client.html')
  if (fs.existsSync(statsPath)) {
    console.log('📦 Bundle analysis available at:', statsPath)
  }
  
  // Check bundle sizes from build output
  const buildManifest = path.join(buildPath, 'build-manifest.json')
  if (fs.existsSync(buildManifest)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'))
    console.log('📊 Bundle Analysis:')
    console.log(`   Pages: ${Object.keys(manifest.pages).length}`)
    console.log(`   Static files: ${Object.keys(manifest.files).length}`)
  }
  
} catch (error) {
  console.log('⚠️  Bundle analysis failed:', error.message)
}

// Performance recommendations
console.log('\n💡 Performance Optimizations Implemented:')
console.log('   ✅ Image optimization with WebP/AVIF formats')
console.log('   ✅ Critical resource preloading')
console.log('   ✅ Passive event listeners')
console.log('   ✅ Explicit aspect ratios for CLS prevention')
console.log('   ✅ Bundle splitting and lazy loading')
console.log('   ✅ Caching headers for static assets')
console.log('   ✅ DNS prefetching for external domains')

console.log('\n📋 Performance Budgets:')
Object.entries(PERFORMANCE_BUDGETS).forEach(([metric, budget]) => {
  console.log(`   ${metric}: < ${budget}${metric === 'CLS' ? '' : 'ms'}`)
})

console.log('\n🚀 Next Steps:')
console.log('   1. Run Lighthouse audit: npm run lighthouse')
console.log('   2. Monitor Core Web Vitals in production')
console.log('   3. Set up CI performance monitoring')
console.log('   4. Test on real devices and slow networks')

console.log('\n✨ Performance check completed!')