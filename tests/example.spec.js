import { test, expect } from '@playwright/test';

test('homepage loads products correctly', async ({ page }) => {
  await page.goto('http://localhost:3001');
  
  // Wait for products to load
  await page.waitForSelector('text="Featured Treasures"', { timeout: 10000 });
  
  // Wait for the API calls to complete
  await page.waitForTimeout(3000);
  
  // Check for specific products you mentioned
  const products = [
    'Big into Energy',
    'Tempura Shrimp',
    'Mickey & Friends'
  ];
  
  for (const product of products) {
    const productElements = page.getByText(product, { exact: false });
    const count = await productElements.count();
    console.log(`Product "${product}" found ${count} times`);
    
    if (count > 0) {
      const isVisible = await productElements.first().isVisible();
      console.log(`Product "${product}" visible:`, isVisible);
      
      if (isVisible) {
        await productElements.first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
      }
    }
  }
  
  // Check how many products are loaded total
  const productCards = page.locator('[class*="luxury-card"]');
  const productCount = await productCards.count();
  console.log(`Total products loaded: ${productCount}`);
  
  // Keep browser open for 10 seconds so you can see the page
  await page.waitForTimeout(10000);
});