import { test } from '@playwright/test';

test('debug snap tab', async ({ page }) => {
  // Listen for console logs
  page.on('console', msg => {
    console.log(`[BROWSER]:`, msg.text());
  });

  // Listen for errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]:', error.message);
  });

  await page.goto('http://localhost:5175');
  await page.waitForTimeout(2000);

  // Check if Snap tab is visible
  const snapTab = await page.locator('text=Snap').count();
  console.log('Snap tab visible:', snapTab > 0);

  // Click Snap tab if not already active
  if (snapTab > 0) {
    await page.locator('text=Snap').click();
    await page.waitForTimeout(1000);
  }

  // Check current state
  const notInstalled = await page.locator('text=Not Installed').count();
  const installed = await page.locator('text=✓ Installed').count();
  console.log('Shows "Not Installed":', notInstalled > 0);
  console.log('Shows "✓ Installed":', installed > 0);

  // Try clicking refresh button
  const refreshButton = await page.locator('button:has-text("Refresh")').count();
  console.log('Refresh button found:', refreshButton > 0);

  if (refreshButton > 0) {
    console.log('Clicking Refresh button...');
    await page.locator('button:has-text("Refresh")').click();
    await page.waitForTimeout(2000);

    // Check state after refresh
    const notInstalledAfter = await page.locator('text=Not Installed').count();
    const installedAfter = await page.locator('text=✓ Installed').count();
    console.log('After refresh - Not Installed:', notInstalledAfter > 0);
    console.log('After refresh - Installed:', installedAfter > 0);
  }

  // Take screenshot
  await page.screenshot({ path: 'snap-tab-debug.png', fullPage: true });
  console.log('Screenshot saved');
});
