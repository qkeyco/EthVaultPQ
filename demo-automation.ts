/**
 * EthVaultPQ Demo Automation Script
 *
 * This script automates the EthVaultPQ Snap demo using Playwright.
 * Manual steps (MetaMask approvals) are clearly marked and paused.
 *
 * Usage:
 *   npx playwright test demo-automation.ts --headed
 */

import { test, expect, Page } from '@playwright/test';

// Helper to pause and show instructions
async function pauseForManualAction(page: Page, instruction: string, stepNumber: string) {
  console.log('\n' + '='.repeat(80));
  console.log(`⏸️  MANUAL ACTION REQUIRED - ${stepNumber}`);
  console.log('='.repeat(80));
  console.log(`\n👉 ${instruction}\n`);
  console.log('Press Enter in the terminal when you have completed this action...');
  console.log('='.repeat(80) + '\n');

  // Show overlay on page
  await page.evaluate((msg) => {
    const overlay = document.createElement('div');
    overlay.id = 'manual-action-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff9800;
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-size: 18px;
      z-index: 999999;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      max-width: 400px;
    `;
    overlay.innerHTML = `
      <strong>⚠️ MANUAL ACTION REQUIRED</strong><br/>
      <div style="margin-top: 10px; font-size: 14px;">${msg}</div>
      <div style="margin-top: 10px; font-size: 12px; opacity: 0.8;">
        Complete the action in MetaMask, then press Enter in the terminal.
      </div>
    `;
    document.body.appendChild(overlay);
  }, instruction);

  // Wait for Enter key in terminal
  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => resolve());
  });

  // Remove overlay
  await page.evaluate(() => {
    document.getElementById('manual-action-overlay')?.remove();
  });

  console.log('✅ Continuing automation...\n');
}

test.describe('EthVaultPQ Snap Demo', () => {
  test('Complete installation and signing demo', async ({ page }) => {
    console.log('\n🎬 Starting EthVaultPQ Demo...\n');

    // Enable stdin for manual pauses
    process.stdin.setRawMode(true);
    process.stdin.resume();

    // ==================================================================
    // SCENE 1: Introduction
    // ==================================================================
    console.log('🎬 SCENE 1: Introduction (0:00 - 0:15)');

    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'demo-01-homepage.png' });

    console.log('✅ Homepage loaded');
    await page.waitForTimeout(2000);

    // ==================================================================
    // SCENE 2: Snap Installation
    // ==================================================================
    console.log('\n🎬 SCENE 2: Snap Installation (0:15 - 0:45)');

    // Navigate to Snap tab
    await page.click('text=Snap');
    await page.waitForSelector('button:has-text("Connect Snap")');
    await page.screenshot({ path: 'demo-02-snap-tab.png' });
    console.log('✅ Snap tab opened');

    await page.waitForTimeout(1000);

    // Click Install
    await page.click('button:has-text("Connect Snap")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'demo-03-install-clicked.png' });
    console.log('✅ Install button clicked');

    // MANUAL: Approve in MetaMask
    await pauseForManualAction(
      page,
      'Click "Connect" and then "Approve & Install" in the MetaMask popup',
      'Step 2.3'
    );

    // ==================================================================
    // SCENE 3: Create Post-Quantum Keys
    // ==================================================================
    console.log('\n🎬 SCENE 3: Create Post-Quantum Keys (0:45 - 1:15)');

    // Wait for installation success
    await page.waitForSelector('button:has-text("Create PQ Keys")' , { timeout: 30000 });
    console.log('✅ Snap installed successfully!');
    await page.screenshot({ path: 'demo-04-snap-installed.png' });

    await page.waitForTimeout(1000);

    // Click Create Keys
    await page.click('button:has-text("Create PQ Keys")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'demo-05-create-keys-clicked.png' });
    console.log('✅ Create Keys clicked');

    // MANUAL: Approve key generation
    await pauseForManualAction(
      page,
      'Click "Approve" in MetaMask to generate the Dilithium3 keypair',
      'Step 3.3'
    );

    // View generated keys
    await page.waitForSelector('.public-key', { timeout: 30000 });

    await page.evaluate(() => {
      const keyElement = document.querySelector('.public-key');
      if (keyElement instanceof HTMLElement) {
        keyElement.style.border = '2px solid #00ff00';
        keyElement.style.padding = '10px';
      }
    });

    const pubKey = await page.textContent('.public-key');
    console.log('📋 Public Key:', pubKey?.substring(0, 50) + '...');

    await page.screenshot({ path: 'demo-06-keys-generated.png' });
    console.log('✅ Keys generated and displayed');

    await page.waitForTimeout(2000);

    // ==================================================================
    // SCENE 4: Sign a Message
    // ==================================================================
    console.log('\n🎬 SCENE 4: Sign a Message (1:15 - 1:50)');

    // Scroll to message section
    await page.evaluate(() => {
      document.querySelector('textarea')?.scrollIntoView({ behavior: 'smooth' });
    });

    await page.waitForTimeout(500);

    // Enter test message
    await page.fill('textarea', 'Hello, Post-Quantum World! 🔐');
    await page.screenshot({ path: 'demo-07-message-entered.png' });
    console.log('✅ Message entered');

    await page.waitForTimeout(1000);

    // Click Sign Message
    await page.click('button:has-text("Sign Message")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'demo-08-sign-clicked.png' });
    console.log('✅ Sign Message clicked');

    // MANUAL: Approve signing
    await pauseForManualAction(
      page,
      'Click "Approve" in MetaMask to sign the message',
      'Step 4.3'
    );

    // View signature
    await page.waitForSelector('.signature-output', { timeout: 30000 });

    await page.evaluate(() => {
      const sigElement = document.querySelector('.signature-output');
      if (sigElement instanceof HTMLElement) {
        sigElement.style.border = '2px solid #00ff00';
        sigElement.style.padding = '10px';
      }
    });

    const signature = await page.textContent('.signature-output');
    const sigLength = signature?.replace(/[^0-9a-fA-F]/g, '').length || 0;
    console.log('✍️ Signature length:', sigLength / 2, 'bytes');

    await page.screenshot({ path: 'demo-09-signature-generated.png' });
    console.log('✅ Signature generated and displayed');

    await page.waitForTimeout(2000);

    // ==================================================================
    // SCENE 5: Sign Transaction with ZK Proof
    // ==================================================================
    console.log('\n🎬 SCENE 5: Sign Transaction with ZK Proof (1:50 - 2:30)');

    // Scroll to transaction section
    await page.evaluate(() => {
      const txInput = document.querySelector('input[name="to"]');
      if (txInput) {
        txInput.scrollIntoView({ behavior: 'smooth' });
      }
    });

    await page.waitForTimeout(500);

    // Enter transaction details
    await page.fill('input[name="to"]', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
    await page.fill('input[name="value"]', '0.001');

    const dataInput = await page.$('input[name="data"]');
    if (dataInput) {
      await page.fill('input[name="data"]', '0x');
    }

    await page.screenshot({ path: 'demo-10-tx-details.png' });
    console.log('✅ Transaction details entered');

    await page.waitForTimeout(1000);

    // Click Sign Transaction
    await page.click('button:has-text("Sign Transaction")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'demo-11-sign-tx-clicked.png' });
    console.log('✅ Sign Transaction clicked');

    // MANUAL: Approve transaction signing
    await pauseForManualAction(
      page,
      'Click "Approve" in MetaMask to sign the transaction',
      'Step 5.3'
    );

    // Watch ZK proof generation
    console.log('⏳ Waiting for ZK proof generation (this takes ~2 seconds)...');

    await page.waitForSelector('.zk-proof-output', { timeout: 60000 });

    await page.evaluate(() => {
      const proofElement = document.querySelector('.zk-proof-output');
      if (proofElement instanceof HTMLElement) {
        proofElement.style.border = '2px solid #FFD700';
        proofElement.style.padding = '10px';
        proofElement.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
      }
    });

    await page.screenshot({ path: 'demo-12-zk-proof-generated.png' });
    console.log('✅ ZK Proof generated!');
    console.log('📊 Gas estimate: ~250K gas (vs 50M direct verification)');

    await page.waitForTimeout(2000);

    // ==================================================================
    // SCENE 6: Gas Savings Comparison
    // ==================================================================
    console.log('\n🎬 SCENE 6: Gas Savings Comparison (2:30 - 2:50)');

    // Show gas comparison overlay
    await page.evaluate(() => {
      const comparison = document.createElement('div');
      comparison.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        padding: 30px;
        border-radius: 10px;
        color: white;
        font-size: 24px;
        z-index: 10000;
      `;
      comparison.innerHTML = `
        <h2 style="margin-top: 0;">Gas Savings</h2>
        <div style="color: #ff4444;">❌ Direct Dilithium: ~50M gas (IMPOSSIBLE)</div>
        <div style="color: #44ff44; margin-top: 10px;">✅ ZK-SNARK Proof: ~250K gas</div>
        <div style="color: #FFD700; margin-top: 20px; font-weight: bold;">💰 99.5% Gas Savings!</div>
      `;
      document.body.appendChild(comparison);
    });

    await page.screenshot({ path: 'demo-13-gas-savings.png' });

    await page.waitForTimeout(3000);

    await page.evaluate(() => {
      document.querySelector('[style*="z-index: 10000"]')?.remove();
    });

    // ==================================================================
    // SCENE 7: Conclusion
    // ==================================================================
    console.log('\n🎬 SCENE 7: Conclusion (2:50 - 3:00)');

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    await page.screenshot({ path: 'demo-14-final.png' });

    console.log('\n' + '='.repeat(80));
    console.log('✅ DEMO COMPLETE!');
    console.log('='.repeat(80));
    console.log('\nScreenshots saved:');
    for (let i = 1; i <= 14; i++) {
      console.log(`  ✓ demo-${String(i).padStart(2, '0')}-*.png`);
    }
    console.log('\n' + '='.repeat(80));

    // Restore terminal
    process.stdin.setRawMode(false);
    process.stdin.pause();
  });
});
