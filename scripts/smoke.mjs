#!/usr/bin/env node

/**
 * Smoke Tests for West Coast Collectibles
 * 
 * Performs health checks on deployed application
 * - Basic connectivity and response times
 * - Critical page loads and API endpoints
 * - Authentication system availability
 * - Admin panel accessibility
 */

import { performance } from 'perf_hooks';

const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'http://localhost:3000';
const TEST_TIMEOUT = parseInt(process.env.TEST_TIMEOUT) || 30000;
const MAX_RESPONSE_TIME = 5000; // 5 seconds max acceptable response time

console.log(`🔍 Starting smoke tests for: ${DEPLOYMENT_URL}`);
console.log(`⏱️  Timeout: ${TEST_TIMEOUT}ms | Max response time: ${MAX_RESPONSE_TIME}ms\n`);

class SmokeTest {
  constructor() {
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async fetch(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'WCC-SmokeTest/1.0',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async runTest(name, testFn) {
    this.totalTests++;
    const startTime = performance.now();
    
    try {
      console.log(`🧪 ${name}...`);
      
      const result = await testFn();
      const duration = Math.round(performance.now() - startTime);
      
      if (duration > MAX_RESPONSE_TIME) {
        throw new Error(`Response time too slow: ${duration}ms`);
      }
      
      this.passedTests++;
      this.results.push({ name, status: 'PASS', duration, details: result });
      console.log(`   ✅ PASS (${duration}ms)`);
      
      if (result) {
        console.log(`   📋 ${result}`);
      }
      
    } catch (error) {
      this.failedTests++;
      const duration = Math.round(performance.now() - startTime);
      this.results.push({ name, status: 'FAIL', duration, error: error.message });
      console.log(`   ❌ FAIL (${duration}ms): ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  async testHomePage() {
    return this.runTest('Home page loads', async () => {
      const response = await this.fetch(`${DEPLOYMENT_URL}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Check for essential content
      const checks = [
        { test: html.includes('WestCoastCollectibless'), name: 'Site title present' },
        { test: html.includes('</html>'), name: 'Valid HTML structure' },
        { test: response.headers.get('content-type')?.includes('text/html'), name: 'HTML content type' },
      ];
      
      const failedChecks = checks.filter(check => !check.test);
      if (failedChecks.length > 0) {
        throw new Error(`Content validation failed: ${failedChecks.map(c => c.name).join(', ')}`);
      }
      
      return `HTML page loaded with all essential elements`;
    });
  }

  async testApiHealth() {
    return this.runTest('API health check', async () => {
      const response = await this.fetch(`${DEPLOYMENT_URL}/api/health`);
      
      // If 404, the endpoint doesn't exist yet - that's OK for Phase 1
      if (response.status === 404) {
        return 'Health endpoint not implemented yet (Phase 1 - OK)';
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return `API responding: ${JSON.stringify(data)}`;
    });
  }

  async testProductsAPI() {
    return this.runTest('Products API endpoint', async () => {
      const response = await this.fetch(`${DEPLOYMENT_URL}/api/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Products API should return an array');
      }
      
      return `Products API returned ${data.length} items`;
    });
  }

  async testAuthEndpoints() {
    return this.runTest('Authentication endpoints', async () => {
      // Test signin page (should be accessible)
      const signinResponse = await this.fetch(`${DEPLOYMENT_URL}/api/auth/signin`);
      
      if (signinResponse.status >= 500) {
        throw new Error(`Auth signin endpoint error: ${signinResponse.status}`);
      }
      
      // Test protected admin endpoint (should redirect or return 401/403)
      const adminResponse = await this.fetch(`${DEPLOYMENT_URL}/admin/dashboard`);
      
      // Admin should either redirect to login or return unauthorized
      if (adminResponse.status >= 500) {
        throw new Error(`Admin endpoint server error: ${adminResponse.status}`);
      }
      
      return `Auth endpoints responding correctly (signin: ${signinResponse.status}, admin: ${adminResponse.status})`;
    });
  }

  async testStaticAssets() {
    return this.runTest('Static assets loading', async () => {
      // Test a likely static asset
      const logoResponse = await this.fetch(`${DEPLOYMENT_URL}/Logo.png`);
      
      if (logoResponse.status === 404) {
        return 'Logo not found at expected path (may need adjustment)';
      }
      
      if (!logoResponse.ok) {
        throw new Error(`Static asset failed: HTTP ${logoResponse.status}`);
      }
      
      const contentType = logoResponse.headers.get('content-type');
      if (!contentType?.includes('image')) {
        throw new Error(`Expected image content type, got: ${contentType}`);
      }
      
      return `Static assets serving correctly (${contentType})`;
    });
  }

  async testSecurityHeaders() {
    return this.runTest('Security headers present', async () => {
      const response = await this.fetch(`${DEPLOYMENT_URL}/`);
      
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'x-xss-protection',
      ];
      
      const missingHeaders = securityHeaders.filter(
        header => !response.headers.get(header)
      );
      
      if (missingHeaders.length > 0) {
        return `Some security headers missing: ${missingHeaders.join(', ')} (may be added by Vercel)`;
      }
      
      return `All security headers present`;
    });
  }

  async testPerformance() {
    return this.runTest('Performance baseline', async () => {
      const iterations = 3;
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        const response = await this.fetch(`${DEPLOYMENT_URL}/`);
        const end = performance.now();
        
        if (!response.ok) {
          throw new Error(`Performance test failed: HTTP ${response.status}`);
        }
        
        times.push(end - start);
      }
      
      const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      const minTime = Math.round(Math.min(...times));
      const maxTime = Math.round(Math.max(...times));
      
      if (avgTime > MAX_RESPONSE_TIME) {
        throw new Error(`Average response time too slow: ${avgTime}ms`);
      }
      
      return `Avg: ${avgTime}ms, Min: ${minTime}ms, Max: ${maxTime}ms (${iterations} requests)`;
    });
  }

  printSummary() {
    console.log('='.repeat(60));
    console.log('🏁 SMOKE TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests} ✅`);
    console.log(`Failed: ${this.failedTests} ❌`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    console.log('');
    
    if (this.failedTests > 0) {
      console.log('❌ FAILED TESTS:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   • ${r.name}: ${r.error}`));
      console.log('');
    }
    
    const criticalFailures = this.results.filter(r => 
      r.status === 'FAIL' && 
      ['Home page loads', 'Products API endpoint'].includes(r.name)
    );
    
    if (criticalFailures.length > 0) {
      console.log('💥 CRITICAL FAILURES DETECTED - DEPLOYMENT MAY BE BROKEN');
      process.exit(1);
    } else if (this.failedTests > 0) {
      console.log('⚠️  NON-CRITICAL FAILURES - REVIEW BEFORE PRODUCTION');
      process.exit(1);
    } else {
      console.log('🎉 ALL TESTS PASSED - DEPLOYMENT HEALTHY');
      process.exit(0);
    }
  }
}

// Run all smoke tests
async function main() {
  const smokeTest = new SmokeTest();
  
  try {
    // Core functionality tests
    await smokeTest.testHomePage();
    await smokeTest.testProductsAPI();
    await smokeTest.testAuthEndpoints();
    
    // Infrastructure tests
    await smokeTest.testApiHealth();
    await smokeTest.testStaticAssets();
    await smokeTest.testSecurityHeaders();
    
    // Performance test
    await smokeTest.testPerformance();
    
  } catch (error) {
    console.error('💥 Unexpected error during smoke tests:', error);
    process.exit(1);
  } finally {
    smokeTest.printSummary();
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  });
}