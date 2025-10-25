# Demo Video Script Generator

Creates automated demo scripts with Playwright automation for video recording.

## Usage

When invoked, this skill:
1. Generates a detailed demo script
2. Marks manual steps (user actions) in **bold**
3. Automates browser actions with Playwright where possible
4. Provides stage directions in *italics*

## Demo Script Format

```
SCENE: [Scene name]
*[Stage direction - camera/setup notes]*

ACTION: [Automated step - will be executed via Playwright]
**MANUAL: [User must perform this action]**

NARRATION: [What to say during this step]
```

## Available Demos

### 1. Snap Installation Demo
- Uninstall existing Snap (if present)
- Install Snap from local/npm
- Create PQ keypair
- View public key
- Sign a message

### 2. ZK Proof Demo
- Sign a transaction with Dilithium3
- Show API call to generate ZK proof
- Display proof details
- Show gas savings (50M → 250K)

### 3. Full E2E Demo
- Complete wallet setup
- Deploy contracts to Tenderly
- Submit transaction with ZK proof
- Verify on-chain

## Instructions

You are now in Demo Video Script mode. Follow these steps:

1. **Ask the user which demo to create:**
   - Snap Installation
   - ZK Proof Generation
   - Full E2E Flow
   - Custom (user describes)

2. **Generate the script** with:
   - Scene descriptions
   - Automated actions (via Playwright)
   - Manual actions (marked **MANUAL:**)
   - Stage directions (*italics*)
   - Narration text

3. **Create Playwright automation** for automated steps:
   ```typescript
   // Example automation
   await page.goto('http://localhost:5175');
   await page.click('button:has-text("Install Snap")');
   await page.waitForSelector('.success-message');
   ```

4. **Execute the demo** (if user confirms):
   - Run Playwright automation
   - Pause at manual steps with clear instructions
   - Wait for user confirmation to continue
   - Generate timing markers for video editing

## Demo Script Template

```markdown
# [Demo Title]

**Duration:** ~X minutes
**Prerequisites:** [List requirements]

---

## SCENE 1: [Scene Name]
*Camera: [Position/focus]*
*Display: [What should be visible]*

### Step 1.1: [Action Name]
**TYPE:** [AUTO/MANUAL]

**ACTION:**
[What happens - Playwright code if AUTO, instructions if MANUAL]

**NARRATION:**
"[What to say during this step]"

**TIMING:** [Expected duration]

---

## SCENE 2: [Next Scene]
...
```

## Playwright Helpers

### MetaMask Snap Installation
```typescript
// Check if Snap is installed
const snapInstalled = await page.evaluate(() => {
  return window.ethereum?.request({
    method: 'wallet_getSnaps'
  });
});

// Install Snap
await page.evaluate(() => {
  return window.ethereum?.request({
    method: 'wallet_requestSnaps',
    params: {
      'npm:@qkey/ethvaultpq-snap': {}
    }
  });
});
```

### Dashboard Interactions
```typescript
// Navigate to dashboard
await page.goto('http://localhost:5175');

// Click Snap tab
await page.click('[data-tab="snap"]');

// Click Create Keys button
await page.click('button:has-text("Create PQ Keys")');

// Wait for success
await page.waitForSelector('.success-message');

// Screenshot
await page.screenshot({ path: 'demo-step-1.png' });
```

### API Call Visualization
```typescript
// Intercept API calls
await page.route('https://api.ethvault.qkey.co/api/prove', route => {
  console.log('📡 API Call intercepted');
  route.continue();
});

// Monitor response
page.on('response', response => {
  if (response.url().includes('/api/prove')) {
    console.log('✅ ZK Proof received');
  }
});
```

## Video Editing Markers

Generate timestamps for key moments:
```
00:00 - Introduction
00:15 - SCENE 1: Install Snap
00:45 - **MANUAL: Approve in MetaMask**
01:00 - SCENE 2: Create Keys
01:30 - Show public key
02:00 - SCENE 3: Sign message
02:30 - Generate ZK proof
03:00 - Show proof details
03:30 - Conclusion
```

## Example Demo Scripts

### Script A: Quick Snap Demo (2 min)
```markdown
# EthVaultPQ Snap - Quick Demo

**Duration:** ~2 minutes
**Prerequisites:** MetaMask installed, localhost:5175 running

---

## SCENE 1: Introduction
*Camera: Full screen browser*
*Display: Dashboard homepage*

### Step 1.1: Open Dashboard
**TYPE:** AUTO

**ACTION:**
```typescript
await page.goto('http://localhost:5175');
await page.waitForLoadState('networkidle');
```

**NARRATION:**
"Welcome to EthVaultPQ, a post-quantum secure wallet using Dilithium3 signatures and ZK-SNARKs."

**TIMING:** 5 seconds

---

## SCENE 2: Install Snap
*Camera: Browser with MetaMask visible*

### Step 2.1: Navigate to Snap Tab
**TYPE:** AUTO

**ACTION:**
```typescript
await page.click('[data-tab="snap"]');
await page.waitForSelector('button:has-text("Install Snap")');
```

**NARRATION:**
"First, let's install the MetaMask Snap."

**TIMING:** 3 seconds

### Step 2.2: Click Install Button
**TYPE:** AUTO

**ACTION:**
```typescript
await page.click('button:has-text("Install Snap")');
```

**NARRATION:**
"Click the Install button..."

**TIMING:** 2 seconds

### Step 2.3: Approve Installation
**TYPE:** MANUAL

**MANUAL:**
**User must click "Approve" in MetaMask popup**
*Camera: Zoom to MetaMask popup*

**NARRATION:**
"...and approve the installation in MetaMask."

**TIMING:** 10 seconds

---

## SCENE 3: Create Keys
*Camera: Full screen browser*

### Step 3.1: Create PQ Keypair
**TYPE:** AUTO (after manual approval)

**ACTION:**
```typescript
await page.waitForSelector('button:has-text("Create PQ Keys")');
await page.click('button:has-text("Create PQ Keys")');
```

**NARRATION:**
"Now let's create a post-quantum keypair using Dilithium3."

**TIMING:** 5 seconds

### Step 3.2: Confirm in MetaMask
**TYPE:** MANUAL

**MANUAL:**
**User must confirm key generation in MetaMask**
*Camera: MetaMask popup*

**NARRATION:**
"Confirm the key generation in MetaMask..."

**TIMING:** 8 seconds

### Step 3.3: View Public Key
**TYPE:** AUTO

**ACTION:**
```typescript
await page.waitForSelector('.public-key-display');
const pubKey = await page.textContent('.public-key-display');
console.log('Public Key:', pubKey);

// Highlight the key
await page.evaluate(() => {
  document.querySelector('.public-key-display')?.classList.add('highlight');
});
```

**NARRATION:**
"...and here's our post-quantum public key. This is a 1952-byte NIST ML-DSA-65 key."

**TIMING:** 8 seconds

---

## SCENE 4: Sign Message
*Camera: Full screen browser*

### Step 4.1: Enter Test Message
**TYPE:** AUTO

**ACTION:**
```typescript
await page.fill('textarea[name="message"]', 'Hello, Post-Quantum World!');
await page.click('button:has-text("Sign Message")');
```

**NARRATION:**
"Let's sign a message with our quantum-resistant signature."

**TIMING:** 5 seconds

### Step 4.2: View Signature
**TYPE:** AUTO

**ACTION:**
```typescript
await page.waitForSelector('.signature-display');
const sig = await page.textContent('.signature-display');
console.log('Signature length:', sig.length);

// Highlight signature
await page.evaluate(() => {
  document.querySelector('.signature-display')?.classList.add('highlight');
});
```

**NARRATION:**
"And there's our signature - 3309 bytes of quantum-resistant security!"

**TIMING:** 8 seconds

---

## SCENE 5: Conclusion
*Camera: Full screen browser*

**NARRATION:**
"EthVaultPQ - securing Web3 for the quantum era. Visit ethvault.qkey.co to learn more."

**TIMING:** 5 seconds

---

**TOTAL TIME:** ~1:54

## Video Editing Notes
- Add transitions between scenes
- Zoom effects on important UI elements
- Highlight API calls with overlays
- Add text overlays for key stats (gas savings, signature size)
- Background music: tech/modern
```

---

Now, let's create the actual demo:

## Step 1: Which demo would you like to create?

Please choose:
1. **Snap Installation Demo** (2 min) - Install, create keys, sign message
2. **ZK Proof Demo** (3 min) - Full signing → ZK proof generation → gas comparison
3. **E2E Demo** (5 min) - Complete flow with contract deployment
4. **Custom Demo** - Describe what you want to show

I'll generate the script and Playwright automation code for your chosen demo.
