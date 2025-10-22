import { test, expect } from '@playwright/test';

test('debug dashboard', async ({ page }) => {
  // Listen for console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Browser Error:', msg.text());
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ Page Error:', error.message);
  });

  // Navigate to dashboard
  console.log('🔍 Loading http://localhost:5175');
  await page.goto('http://localhost:5175');

  // Wait a bit for React to load
  await page.waitForTimeout(3000);

  // Check if root div has content
  const rootContent = await page.locator('#root').innerHTML();
  console.log('📄 Root content length:', rootContent.length);

  if (rootContent.length < 100) {
    console.log('⚠️ Root div is nearly empty!');
    console.log('Root HTML:', rootContent);
  }

  // Try to find the header
  const header = await page.locator('h1').textContent().catch(() => null);
  if (header) {
    console.log('✅ Found header:', header);
  } else {
    console.log('❌ No h1 found');
  }

  // Print all errors
  if (errors.length > 0) {
    console.log('\n🚨 Total errors:', errors.length);
    errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  } else {
    console.log('✅ No JavaScript errors detected');
  }

  // Take screenshot
  await page.screenshot({ path: 'dashboard-debug.png', fullPage: true });
  console.log('📸 Screenshot saved to dashboard-debug.png');
});
