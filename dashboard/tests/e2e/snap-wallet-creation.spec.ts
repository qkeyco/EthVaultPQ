import { test, expect } from '@playwright/test';

/**
 * Test Snap wallet creation and capture all console logs/errors
 */
test('Snap wallet creation with full console logging', async ({ page }) => {
  // Capture all console messages
  const consoleMessages: string[] = [];
  const consoleErrors: string[] = [];

  page.on('console', (msg) => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    console.log(text);
  });

  page.on('pageerror', (error) => {
    const text = `[PAGE ERROR] ${error.message}\n${error.stack}`;
    consoleErrors.push(text);
    console.error(text);
  });

  // Navigate to dashboard
  console.log('🌐 Navigating to dashboard...');
  await page.goto('http://localhost:5175');

  // Wait for page to load
  await page.waitForLoadState('networkidle');
  console.log('✅ Dashboard loaded');

  // Check if we're on the Snap tab
  const snapTab = page.locator('text=Snap');
  await expect(snapTab).toBeVisible();
  console.log('✅ Snap tab is visible');

  // Take screenshot of initial state
  await page.screenshot({ path: 'snap-tab-initial.png', fullPage: true });
  console.log('📸 Screenshot saved: snap-tab-initial.png');

  // Look for Snap status
  const snapStatus = await page.locator('text=/Installed|Not Installed/').textContent();
  console.log(`📊 Snap Status: ${snapStatus}`);

  // Check if "Create PQ Wallet" button exists
  const createWalletButton = page.locator('button:has-text("Create PQ Wallet")');
  const isCreateWalletVisible = await createWalletButton.isVisible();
  console.log(`🔍 Create PQ Wallet button visible: ${isCreateWalletVisible}`);

  if (!isCreateWalletVisible) {
    console.log('ℹ️ Create PQ Wallet button not visible - checking for Install Snap button');
    const installButton = page.locator('button:has-text("Install Snap")');
    const isInstallVisible = await installButton.isVisible();
    console.log(`🔍 Install Snap button visible: ${isInstallVisible}`);
  }

  // Check dashboard console output
  const dashboardConsole = page.locator('#output, .console, [class*="console"]');
  if (await dashboardConsole.count() > 0) {
    const consoleText = await dashboardConsole.first().textContent();
    console.log('📝 Dashboard Console Output:');
    console.log(consoleText);
  }

  // Take final screenshot
  await page.screenshot({ path: 'snap-tab-final.png', fullPage: true });
  console.log('📸 Final screenshot saved: snap-tab-final.png');

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('CONSOLE MESSAGES SUMMARY');
  console.log('='.repeat(80));
  consoleMessages.forEach(msg => console.log(msg));

  if (consoleErrors.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('ERRORS DETECTED');
    console.log('='.repeat(80));
    consoleErrors.forEach(err => console.error(err));
  }

  console.log('\n' + '='.repeat(80));
  console.log('TEST COMPLETE');
  console.log('='.repeat(80));
});
