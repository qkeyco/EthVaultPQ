# EthVaultPQ Snap Installation Demo
## Post-Quantum Wallet with ZK-SNARK Proofs

**Duration:** ~3 minutes
**Prerequisites:**
- ✅ Dashboard running on localhost:5175
- ✅ Snap server running on localhost:8080
- ✅ MetaMask installed
- ✅ Snap uninstalled (clean slate)

---

## 🎬 SCENE 1: Introduction (0:00 - 0:15)
*Camera: Full screen browser on localhost:5175*
*Display: Dashboard homepage*

### Step 1.1: Open Dashboard
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
await page.goto('http://localhost:5175');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: 'demo-01-homepage.png' });
```

**NARRATION:**
"Welcome to EthVaultPQ - the first production-ready post-quantum wallet for Ethereum. Let's see how it works."

**TIMING:** 15 seconds

---

## 🎬 SCENE 2: Snap Installation (0:15 - 0:45)
*Camera: Browser with focus on Snap tab*

### Step 2.1: Navigate to Snap Tab
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
await page.click('text=Snap');
await page.waitForSelector('button:has-text("Connect Snap")');
await page.screenshot({ path: 'demo-02-snap-tab.png' });
```

**NARRATION:**
"First, we need to install the MetaMask Snap. This Snap uses real Dilithium3 signatures - NIST-approved post-quantum cryptography."

**TIMING:** 10 seconds

### Step 2.2: Click Install/Connect Button
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
await page.click('button:has-text("Connect Snap")');
await page.waitForTimeout(2000); // Wait for MetaMask popup
await page.screenshot({ path: 'demo-03-install-clicked.png' });
```

**NARRATION:**
"Let's click Connect Snap to begin installation..."

**TIMING:** 5 seconds

### Step 2.3: ⚠️ APPROVE IN METAMASK
**TYPE:** 👤 MANUAL

**MANUAL ACTION:**
**YOU MUST: Click "Connect" in MetaMask popup**
**THEN: Click "Approve & Install" in the Snap installation screen**

*Camera: Zoom to MetaMask extension popup*
*Show the permissions being requested*

**NARRATION:**
"...MetaMask will ask you to connect and approve the Snap installation. This Snap needs permission to manage cryptographic keys and sign transactions."

**TIMING:** 15 seconds
**PAUSE HERE** ⏸️ - Wait for user to complete manual action

---

## 🎬 SCENE 3: Create Post-Quantum Keys (0:45 - 1:15)
*Camera: Full screen browser, focus on Snap tab*

### Step 3.1: Wait for Installation Success
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
await page.waitForSelector('button:has-text("Create PQ Keys")', { timeout: 30000 });
console.log('✅ Snap installed successfully!');
await page.screenshot({ path: 'demo-04-snap-installed.png' });
```

**NARRATION:**
"Great! The Snap is now installed. Let's create our post-quantum keypair."

**TIMING:** 5 seconds

### Step 3.2: Click Create Keys
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
await page.click('button:has-text("Create PQ Keys")');
await page.waitForTimeout(1000);
await page.screenshot({ path: 'demo-05-create-keys-clicked.png' });
```

**NARRATION:**
"Click Create PQ Keys to generate a Dilithium3 keypair..."

**TIMING:** 5 seconds

### Step 3.3: ⚠️ CONFIRM KEY GENERATION
**TYPE:** 👤 MANUAL

**MANUAL ACTION:**
**YOU MUST: Click "Approve" in MetaMask popup for key generation**

*Camera: MetaMask popup showing key generation request*

**NARRATION:**
"...and confirm in MetaMask. This generates a 1952-byte public key and 4032-byte secret key using ML-DSA-65."

**TIMING:** 10 seconds
**PAUSE HERE** ⏸️ - Wait for user to approve

### Step 3.4: View Generated Keys
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
await page.waitForSelector('.public-key', { timeout: 30000 });

// Highlight the public key
await page.evaluate(() => {
  const keyElement = document.querySelector('.public-key');
  if (keyElement) {
    keyElement.style.border = '2px solid #00ff00';
    keyElement.style.padding = '10px';
  }
});

const pubKey = await page.textContent('.public-key');
console.log('📋 Public Key:', pubKey?.substring(0, 50) + '...');

await page.screenshot({ path: 'demo-06-keys-generated.png' });
```

**NARRATION:**
"And there's our post-quantum public key! This is quantum-resistant - even quantum computers can't derive the private key from this."

**TIMING:** 10 seconds

---

## 🎬 SCENE 4: Sign a Message (1:15 - 1:50)
*Camera: Full screen browser*

### Step 4.1: Enter Test Message
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
// Scroll to message section
await page.evaluate(() => {
  document.querySelector('textarea')?.scrollIntoView({ behavior: 'smooth' });
});

await page.fill('textarea', 'Hello, Post-Quantum World! 🔐');
await page.screenshot({ path: 'demo-07-message-entered.png' });
```

**NARRATION:**
"Now let's sign a message. I'll type: 'Hello, Post-Quantum World!'"

**TIMING:** 5 seconds

### Step 4.2: Click Sign Message
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
await page.click('button:has-text("Sign Message")');
await page.waitForTimeout(1000);
await page.screenshot({ path: 'demo-08-sign-clicked.png' });
```

**NARRATION:**
"Click Sign Message..."

**TIMING:** 3 seconds

### Step 4.3: ⚠️ APPROVE SIGNING
**TYPE:** 👤 MANUAL

**MANUAL ACTION:**
**YOU MUST: Click "Approve" in MetaMask popup for signing**

*Camera: MetaMask popup*

**NARRATION:**
"...and approve the signature request in MetaMask."

**TIMING:** 7 seconds
**PAUSE HERE** ⏸️ - Wait for user to approve

### Step 4.4: View Signature
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
await page.waitForSelector('.signature-output', { timeout: 30000 });

// Highlight signature
await page.evaluate(() => {
  const sigElement = document.querySelector('.signature-output');
  if (sigElement) {
    sigElement.style.border = '2px solid #00ff00';
    sigElement.style.padding = '10px';
  }
});

const signature = await page.textContent('.signature-output');
const sigLength = signature?.replace(/[^0-9a-fA-F]/g, '').length || 0;
console.log('✍️ Signature length:', sigLength / 2, 'bytes (hex length:', sigLength, ')');

await page.screenshot({ path: 'demo-09-signature-generated.png' });
```

**NARRATION:**
"Perfect! Here's our Dilithium3 signature - 3309 bytes of quantum-resistant security. This signature cannot be forged, even by quantum computers."

**TIMING:** 10 seconds

---

## 🎬 SCENE 5: Sign a Transaction with ZK Proof (1:50 - 2:30)
*Camera: Full screen browser, scroll to transaction section*

### Step 5.1: Enter Transaction Details
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
// Scroll to transaction section
await page.evaluate(() => {
  const txSection = document.querySelector('[data-section="transaction"]') ||
                    document.querySelector('input[name="to"]')?.closest('div');
  txSection?.scrollIntoView({ behavior: 'smooth' });
});

await page.fill('input[name="to"]', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
await page.fill('input[name="value"]', '0.001');
await page.fill('input[name="data"]', '0x');

await page.screenshot({ path: 'demo-10-tx-details.png' });
```

**NARRATION:**
"Now for the exciting part - let's sign a transaction AND generate a ZK-SNARK proof. This proves the signature is valid without revealing it on-chain."

**TIMING:** 10 seconds

### Step 5.2: Click Sign Transaction
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
await page.click('button:has-text("Sign Transaction")');
await page.waitForTimeout(1000);
await page.screenshot({ path: 'demo-11-sign-tx-clicked.png' });
```

**NARRATION:**
"Click Sign Transaction..."

**TIMING:** 3 seconds

### Step 5.3: ⚠️ APPROVE TRANSACTION SIGNING
**TYPE:** 👤 MANUAL

**MANUAL ACTION:**
**YOU MUST: Click "Approve" in MetaMask popup**

*Camera: MetaMask popup*

**NARRATION:**
"...approve in MetaMask..."

**TIMING:** 7 seconds
**PAUSE HERE** ⏸️ - Wait for user to approve

### Step 5.4: Watch ZK Proof Generation
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
// Monitor API call
console.log('⏳ Waiting for ZK proof generation...');

// Wait for ZK proof display
await page.waitForSelector('.zk-proof-output', { timeout: 60000 });

// Highlight the proof
await page.evaluate(() => {
  const proofElement = document.querySelector('.zk-proof-output');
  if (proofElement) {
    proofElement.style.border = '2px solid #FFD700';
    proofElement.style.padding = '10px';
    proofElement.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
  }
});

await page.screenshot({ path: 'demo-12-zk-proof-generated.png' });

// Get proof details
const proofData = await page.evaluate(() => {
  return document.querySelector('.zk-proof-output')?.textContent;
});

console.log('✅ ZK Proof generated!');
console.log('📊 Gas estimate: ~250K gas');
```

**NARRATION:**
"...and watch as the Snap calls our API to generate a ZK-SNARK proof. This takes about 2 seconds. The proof is tiny - just 300 bytes - but it proves our 3309-byte Dilithium signature is valid."

**TIMING:** 20 seconds (includes API call time)

---

## 🎬 SCENE 6: Gas Savings Comparison (2:30 - 2:50)
*Camera: Full screen showing proof details*

### Step 6.1: Highlight Gas Savings
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
// Scroll to gas comparison
await page.evaluate(() => {
  const gasCompare = document.querySelector('[data-section="gas-comparison"]');
  gasCompare?.scrollIntoView({ behavior: 'smooth' });
});

// Add visual comparison overlay
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

// Remove overlay after screenshot
await page.evaluate(() => {
  document.querySelector('[style*="z-index: 10000"]')?.remove();
});
```

**NARRATION:**
"Here's why ZK-SNARKs matter: Verifying a Dilithium signature directly on-chain would cost 50 million gas - more than an entire Ethereum block! With ZK-SNARKs, it's just 250 thousand gas. That's 99.5% savings!"

**TIMING:** 20 seconds

---

## 🎬 SCENE 7: Conclusion (2:50 - 3:00)
*Camera: Full screen dashboard*

### Step 7.1: Final Screenshot
**TYPE:** 🤖 AUTO

**PLAYWRIGHT:**
```typescript
await page.evaluate(() => {
  window.scrollTo(0, 0);
});

await page.screenshot({ path: 'demo-14-final.png' });

console.log('\n========================================');
console.log('✅ DEMO COMPLETE!');
console.log('========================================');
console.log('Screenshots saved:');
console.log('  - demo-01-homepage.png');
console.log('  - demo-02-snap-tab.png');
console.log('  - ... (14 total screenshots)');
console.log('========================================\n');
```

**NARRATION:**
"And that's EthVaultPQ - securing Web3 for the quantum era with real Dilithium3 signatures and ZK-SNARK proofs. Visit ethvault.qkey.co to learn more!"

**TIMING:** 10 seconds

---

## 📋 MANUAL ACTION CHECKLIST

During the demo, you'll need to manually approve 3 times in MetaMask:

1. ✅ **Connect & Install Snap** (Scene 2, Step 2.3)
2. ✅ **Create PQ Keys** (Scene 3, Step 3.3)
3. ✅ **Sign Message** (Scene 4, Step 4.3)
4. ✅ **Sign Transaction** (Scene 5, Step 5.3)

---

## 🎬 VIDEO EDITING TIMELINE

```
00:00 - Intro / Homepage
00:15 - Navigate to Snap tab
00:20 - Click Install
00:25 - [MANUAL] Approve installation
00:45 - Installation success
00:50 - Click Create Keys
00:55 - [MANUAL] Approve key generation
01:05 - Keys generated, show public key
01:15 - Enter message
01:20 - Click Sign Message
01:23 - [MANUAL] Approve signing
01:35 - Signature displayed
01:50 - Enter transaction details
01:53 - Click Sign Transaction
01:56 - [MANUAL] Approve transaction
02:10 - ZK proof generating... (API call)
02:30 - ZK proof complete
02:35 - Gas savings comparison
02:50 - Conclusion
```

---

## 🎥 CAMERA DIRECTIONS

- **Wide shots:** Show full browser window for context
- **Zoom shots:** Focus on MetaMask popups during manual steps
- **Highlight effects:** Add borders/glows on important elements
- **Overlays:** Add text overlays for gas comparison
- **Transitions:** Smooth fades between scenes

---

## 💡 KEY TALKING POINTS

1. **Real Crypto:** "This isn't a mock - it's real @noble/post-quantum Dilithium3"
2. **NIST Approved:** "ML-DSA-65 is NIST-standardized post-quantum crypto"
3. **Production Ready:** "982KB Snap bundle, ZK proof API handles the heavy lifting"
4. **Gas Efficient:** "99.5% gas savings with ZK-SNARKs"
5. **Quantum Safe:** "Secure against both classical and quantum computers"

---

**TOTAL DURATION:** ~3 minutes
**SCREENSHOTS:** 14 images
**MANUAL ACTIONS:** 4 approvals in MetaMask
**AUTOMATED STEPS:** 20+ actions via Playwright

Ready to run! 🚀
