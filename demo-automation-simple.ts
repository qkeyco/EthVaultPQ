/**
 * EthVaultPQ Demo Automation Script (Simplified)
 * Automates everything except MetaMask approvals
 */

import { test, expect, Page } from '@playwright/test';

// Helper to show instructions and wait
async function showManualStep(page: Page, instruction: string, stepNumber: string, waitSeconds: number = 15) {
  console.log('\n' + '='.repeat(80));
  console.log(`⏸️  MANUAL ACTION REQUIRED - ${stepNumber}`);
  console.log('='.repeat(80));
  console.log(`\n👉 ${instruction}\n`);
  console.log(`⏱️  Waiting ${waitSeconds} seconds for you to complete this action...`);
  console.log('='.repeat(80) + '\n');

  // Show overlay on page
  await page.evaluate((msg) => {
    const overlay = document.createElement('div');
    overlay.id = 'manual-action-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff9800;
      color: white;
      padding: 30px;
      border-radius: 15px;
      font-size: 20px;
      z-index: 999999;
      box-shadow: 0 8px 16px rgba(0,0,0,0.5);
      max-width: 500px;
      text-align: center;
      border: 3px solid #fff;
    `;
    overlay.innerHTML = `
      <strong style="font-size: 24px;">⚠️ MANUAL ACTION REQUIRED</strong><br/><br/>
      <div style="margin-top: 10px; font-size: 18px; line-height: 1.5;">${msg}</div>
      <div style="margin-top: 20px; font-size: 14px; opacity: 0.9; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px;">
        Please complete this action in MetaMask
      </div>
    `;
    document.body.appendChild(overlay);
  }, instruction);

  // Wait for specified time
  await page.waitForTimeout(waitSeconds * 1000);

  // Remove overlay
  await page.evaluate(() => {
    document.getElementById('manual-action-overlay')?.remove();
  });

  console.log('✅ Continuing automation...\n');
}

test.describe('EthVaultPQ Snap Demo', () => {
  test('Complete installation and signing demo', async ({ page }) => {
    console.log('\n🎬 Starting EthVaultPQ Demo...\n');

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
    await page.waitForTimeout(500);

    // Wait for the button to appear
    const connectButton = await page.waitForSelector('button:has-text("Connect Snap")');
    await page.screenshot({ path: 'demo-02-snap-tab.png' });
    console.log('✅ Snap tab opened');

    await page.waitForTimeout(1000);

    // Click Install
    await connectButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'demo-03-install-clicked.png' });
    console.log('✅ Install button clicked');

    // MANUAL: Approve in MetaMask
    await showManualStep(
      page,
      'Click "Connect" and then "Approve & Install" in the MetaMask popup',
      'Step 2.3',
      20  // 20 seconds to approve
    );

    // ==================================================================
    // SCENE 3: Create Post-Quantum Keys
    // ==================================================================
    console.log('\n🎬 SCENE 3: Create Post-Quantum Keys (0:45 - 1:15)');

    // Wait for installation success
    try {
      await page.waitForSelector('button:has-text("Create PQ Keys")', { timeout: 5000 });
      console.log('✅ Snap installed successfully!');
    } catch (e) {
      console.log('⚠️  Snap may not be installed yet, taking screenshot...');
    }

    await page.screenshot({ path: 'demo-04-snap-installed.png' });
    await page.waitForTimeout(1000);

    // Click Create Keys (if button exists)
    const createKeysButton = await page.$('button:has-text("Create PQ Keys")');
    if (createKeysButton) {
      await createKeysButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'demo-05-create-keys-clicked.png' });
      console.log('✅ Create Keys clicked');

      // MANUAL: Approve key generation
      await showManualStep(
        page,
        'Click "Approve" in MetaMask to generate the Dilithium3 keypair',
        'Step 3.3',
        15
      );

      // View generated keys
      try {
        await page.waitForSelector('.public-key', { timeout: 5000 });

        await page.evaluate(() => {
          const keyElement = document.querySelector('.public-key');
          if (keyElement instanceof HTMLElement) {
            keyElement.style.border = '2px solid #00ff00';
            keyElement.style.padding = '10px';
          }
        });

        const pubKey = await page.textContent('.public-key');
        console.log('📋 Public Key:', pubKey?.substring(0, 50) + '...');
      } catch (e) {
        console.log('⚠️  Public key not displayed yet');
      }

      await page.screenshot({ path: 'demo-06-keys-generated.png' });
      console.log('✅ Keys section captured');
    } else {
      console.log('⚠️  Create Keys button not found - may need more time for Snap install');
      await page.screenshot({ path: 'demo-skip-keys.png' });
    }

    await page.waitForTimeout(2000);

    // ==================================================================
    // SCENE 4: Sign a Message
    // ==================================================================
    console.log('\n🎬 SCENE 4: Sign a Message (1:15 - 1:50)');

    // Look for textarea
    const messageArea = await page.$('textarea');
    if (messageArea) {
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
      const signButton = await page.$('button:has-text("Sign Message")');
      if (signButton) {
        await signButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'demo-08-sign-clicked.png' });
        console.log('✅ Sign Message clicked');

        // MANUAL: Approve signing
        await showManualStep(
          page,
          'Click "Approve" in MetaMask to sign the message',
          'Step 4.3',
          15
        );

        // View signature
        try {
          await page.waitForSelector('.signature-output', { timeout: 5000 });

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
        } catch (e) {
          console.log('⚠️  Signature not displayed yet');
        }

        await page.screenshot({ path: 'demo-09-signature-generated.png' });
        console.log('✅ Signature section captured');
      }
    } else {
      console.log('⚠️  Message section not found');
    }

    await page.waitForTimeout(2000);

    // ==================================================================
    // SCENE 5: Final Screenshot
    // ==================================================================
    console.log('\n🎬 SCENE 5: Final State');

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    await page.screenshot({ path: 'demo-10-final.png' });

    console.log('\n' + '='.repeat(80));
    console.log('✅ DEMO COMPLETE!');
    console.log('='.repeat(80));
    console.log('\n📸 Screenshots saved in current directory');
    console.log('🎥 Video saved in test-results/');
    console.log('\n' + '='.repeat(80));
  });
});
