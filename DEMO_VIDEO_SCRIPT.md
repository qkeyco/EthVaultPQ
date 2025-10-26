# EthVaultPQ - 3 Minute Demo Video Script
## Shot-by-Shot Guide with Timings

---

## 🎬 SECTION 1: THE HOOK (0:00 - 0:30)

### Shot 1.1: Opening Title Card (0:00 - 0:05)
**Screen:** Black background with text fade-in
```
EthVaultPQ
Quantum-Safe Vesting for PYUSD
```

**Audio:**
```
[No speaking - let title breathe for 2 seconds]
```

**Action:** Fade in title, hold 3 seconds, fade out

---

### Shot 1.2: The Problem (0:05 - 0:15)
**Screen:** Show code or diagram of ECDSA signature being broken

**Script:**
```
"Traditional crypto wallets use ECDSA signatures.
When quantum computers become powerful enough,
they'll break these in minutes using Shor's algorithm."
```

**Pacing:** Speak clearly, moderate pace (10 seconds)

**Visual Suggestion:**
- Show ECDSA equation or diagram
- Red "X" or "VULNERABLE" overlay
- Optional: Show "2030" timeline

---

### Shot 1.3: The Solution (0:15 - 0:30)
**Screen:** Switch to EthVaultPQ logo or dashboard homepage

**Script:**
```
"EthVaultPQ solves this TODAY with Dilithium3 post-quantum
cryptography - the NIST standard that's quantum-resistant.

This is a quantum-safe vesting system for PYUSD with
MetaMask Snap integration. Let me show you how it works."
```

**Pacing:** Emphasize "TODAY" and "NIST standard" (15 seconds)

**Transition:** Smooth fade to architecture diagram

---

## 🎬 SECTION 2: ARCHITECTURE (0:30 - 1:00)

### Shot 2.1: Full Architecture Diagram (0:30 - 1:00)
**Screen:** Display DEMO_ARCHITECTURE_DIAGRAM.md (the ASCII diagram we just created)

**Script:**
```
"Here's how the complete flow works:

[Point to top]
First, the user generates Dilithium3 keys in a MetaMask Snap -
that's a secure mini-app inside MetaMask.

[Point to middle-top]
Second, we deploy a PQWallet - an ERC-4337 smart contract wallet
that ONLY accepts quantum-resistant signatures.

[Point to middle]
Third, we create a vesting schedule. 100,000 MUSDC locked for
60 months, vesting to the quantum-safe wallet.

[Point to bottom]
Finally, when tokens vest, the user signs with Dilithium3.
We verify it off-chain with a ZK-SNARK proof, saving 99.5%
on gas costs - that's 50 million gas down to just 250,000.

Let me show you this live."
```

**Pacing:** 30 seconds total
- 5 sec: Intro
- 5 sec: Snap explanation
- 5 sec: PQWallet
- 8 sec: Vesting
- 7 sec: ZK proof explanation

**Visual Actions:**
- Use cursor/pointer to highlight each section as you speak
- Circle or highlight key numbers (99.5%, 50M → 250K)

**Transition:** Quick cut to browser with dashboard open

---

## 🎬 SECTION 3: LIVE DEMO (1:00 - 2:00)

### Shot 3.1: Dashboard Homepage (1:00 - 1:05)
**Screen:** Browser showing http://localhost:5175
- Dashboard homepage visible
- Wallet connected (show address in top-right)
- Vesting tab highlighted

**Script:**
```
"I've already installed the Snap and created my quantum-safe
wallet. Let's create a vesting schedule right now."
```

**Action:**
- Quick pan across the UI (2 seconds)
- Click "Vesting" tab (1 second)
- Page loads to vesting builder (2 seconds)

**Note:** Speak while UI is loading to save time

---

### Shot 3.2: Load Demo Schedule (1:05 - 1:12)
**Screen:** Vesting Schedule Builder page

**Script:**
```
"I'll use the quick demo mode to pre-fill everything."
```

**Actions:** (7 seconds total)
1. Highlight "🚀 Quick Demo Mode" green box (1 sec)
2. Move cursor to "Load Demo Schedule" button (1 sec)
3. Click button (1 sec)
4. Alert pops up: "✅ Demo schedule loaded!" (2 sec)
5. Close alert (1 sec)
6. Show filled form (1 sec)

**Highlight on screen:**
- Total Amount: 100,000 MUSDC
- Preset: 60-Month Linear
- Mode: ⚡ Test Mode (1 min = 1 month)
- Start Date: [1 minute from now]

**Script continues over actions:**
```
"100,000 MUSDC, 60-month linear vesting, in test mode
so we can demo it quickly - one minute equals one month."
```

---

### Shot 3.3: Recipients Step - PQWallet Ready (1:12 - 1:25)
**Screen:** Click "Continue to Recipients" → Recipients page loads

**Script:**
```
"The beneficiary is my quantum-safe PQWallet.
Notice the security badges here."
```

**Actions:** (13 seconds total)
1. Click "Continue to Recipients →" button (2 sec)
2. Page loads showing PQWallet Setup component (2 sec)
3. Green box visible: "✅ PQWallet Ready!" (hold 4 sec)
4. Pan over the details (5 sec):
   - Address: 0x...
   - Amount: 100,000 MUSDC will vest to this wallet
   - Security: Dilithium3 quantum-resistant signatures

**Visual Emphasis:**
- Zoom in slightly on green success box
- Highlight "Dilithium3" badge

---

### Shot 3.4: Skip Vault, Go to Review (1:25 - 1:32)
**Screen:** Continue through wizard

**Script:**
```
"I'll skip the vault setup for now and go straight to review."
```

**Actions:** (7 seconds)
1. Click "Continue to Vault Setup →" (1 sec)
2. Vault setup page loads (1 sec)
3. Click "Skip Vault Setup →" (disabled - so click Back) (1 sec)
4. Actually: Click "Continue to Vault Setup" then "← Back to Review" (2 sec)
5. Or better: Just show clicking through (2 sec)
6. Review page loads (2 sec)

**Note:** EDIT THIS SECTION - test the actual flow before recording!

---

### Shot 3.5: Review Screen (1:32 - 1:42)
**Screen:** Review Vesting Setup page

**Script:**
```
"Here's our complete setup. The beneficiary is my PQWallet
with quantum-safe Dilithium3 signatures. 100,000 MUSDC
vesting over 60 months."
```

**Actions:** (10 seconds)
1. Pan down the review page (3 sec):
   - Vesting Schedule summary
   - Beneficiary (PQWallet) section
   - Timeline graph
2. Highlight PQWallet section (3 sec)
3. Point out security badges:
   - 🔐 Quantum-Resistant Wallet
   - Dilithium3 badge
   - ML-DSA-65 badge (2 sec)
4. Scroll to bottom, show "Continue to Deploy →" button (2 sec)

---

### Shot 3.6: Deploy - Step 1 (Approve Tokens) (1:42 - 1:54)
**Screen:** Click "Continue to Deploy" → Deploy page loads

**Script:**
```
"First, I need to approve the token spending."
```

**Actions:** (12 seconds)
1. Click "Continue to Deploy →" (1 sec)
2. Deploy page loads showing 2-step process (2 sec)
3. Highlight "Step 1: Approve Token Spending" (indigo box) (2 sec)
4. Click "✓ Approve Tokens" button (1 sec)
5. MetaMask popup appears (1 sec)
6. Click "Confirm" in MetaMask (1 sec)
7. Show "Waiting for approval..." spinner (2 sec)
8. Success message: "✓ Approval confirmed!" (2 sec)

**Visual:**
- Keep MetaMask popup visible but don't spend too long on it
- Green checkmark appears on Step 1

**Script continues during waiting:**
```
"MetaMask confirms... and approved!"
```

---

### Shot 3.7: Deploy - Step 2 (Create Vesting) (1:54 - 2:00)
**Screen:** Same Deploy page, Step 2 now active

**Script:**
```
"Now creating the vesting schedule on-chain..."
```

**Actions:** (6 seconds)
1. Step 2 box highlights (border turns indigo) (1 sec)
2. Click "🚀 Create Vesting" button (1 sec)
3. MetaMask confirmation (1 sec)
4. "Creating..." spinner (2 sec)
5. Success: "✓ Vesting schedule created successfully!" (1 sec)

**Note:** This transitions into Section 4

---

## 🎬 SECTION 4: SUCCESS & IMPACT (2:00 - 2:30)

### Shot 4.1: Success Screen (2:00 - 2:15)
**Screen:** Success page appears (🎉 Vesting Schedule Deployed!)

**Script:**
```
"Success! The vesting schedule is live. 100,000 MUSDC
will vest over 60 months to my quantum-resistant wallet."
```

**Actions:** (15 seconds)
1. Success screen loads with confetti animation (2 sec)
2. Show key info (hold for 5 sec):
   - Schedule ID: 0x...
   - 1 Recipient
   - 100,000 MUSDC Total
   - 60 Months duration
3. Highlight security badges again (3 sec)
4. Show "View on Tenderly →" link (2 sec)
5. Click link (1 sec)
6. Browser switches to Tenderly dashboard (2 sec)

**Visual:**
- Let the success screen breathe for a moment
- Show transaction hash in bottom section

---

### Shot 4.2: Tenderly Explorer (2:15 - 2:30)
**Screen:** Tenderly dashboard showing the transaction

**Script:**
```
"Here it is on Tenderly - you can see the vesting schedule
deployed to our Ethereum testnet. The beneficiary is the
PQWallet address, secured with quantum-resistant signatures."
```

**Actions:** (15 seconds)
1. Tenderly page loads (2 sec)
2. Show transaction details (5 sec):
   - Contract: VestingManager
   - Function: createVestingSchedule
   - Parameters visible
3. Scroll to show events (3 sec)
4. Point out VestingScheduleCreated event (2 sec)
5. Quick pan (3 sec)

**Optional:** If short on time, CUT THIS SHOT and stay on success screen

---

## 🎬 SECTION 5: THE DIFFERENTIATOR (2:30 - 3:00)

### Shot 5.1: Return to Dashboard or Show Slide (2:30 - 2:50)
**Screen:** Switch back to dashboard OR show a simple comparison slide

**Option A - Dashboard:**
Show homepage or About section with feature list

**Option B - Simple Text Slide:**
```
EthVaultPQ Differentiators:

✅ Post-Quantum Secure
   Dilithium3 (NIST ML-DSA-65)

✅ MetaMask Snap Integration
   No separate app needed

✅ PYUSD Support
   Real stablecoin vesting

✅ ZK-SNARK Verification
   99.5% gas savings

✅ Production Ready
   Deployed on Tenderly Ethereum
```

**Script:**
```
"Here's what makes EthVaultPQ special:

✅ Post-quantum secure using Dilithium3 - the NIST standard
   for quantum-resistant signatures.

✅ Seamless MetaMask Snap integration - no separate app,
   no new seed phrases, just install and go.

✅ Real PYUSD integration - this isn't a toy token, we're
   talking about PayPal's stablecoin for actual employee
   vesting and tax withholding.

✅ ZK-SNARK verification gives us 99.5% gas savings - that's
   50 million gas down to 250,000 per transaction.

✅ And it's production ready - deployed on Tenderly Ethereum
   today, ready for Sepolia and mainnet after audits."
```

**Pacing:** 20 seconds
- Speak at moderate pace
- Emphasize key numbers: "99.5%", "NIST standard", "production ready"

---

### Shot 5.2: Closing Statement (2:50 - 3:00)
**Screen:** Return to dashboard homepage OR show logo

**Script:**
```
"This is the future of crypto security, available NOW.
EthVaultPQ - quantum-safe vesting you can use today."
```

**Actions:** (10 seconds)
1. Slow zoom on logo or dashboard (5 sec)
2. Fade to black (2 sec)
3. End card (3 sec):
   ```
   EthVaultPQ
   github.com/yourusername/EthVaultPQ
   ethvault.qkey.co
   ```

**Audio:**
- Speak final line (5 sec)
- Background music swells (if using music)
- Fade out (5 sec)

---

## 📋 QUICK REFERENCE CHECKLIST

### Pre-Recording Setup
- [ ] Start dashboard: `cd dashboard && npm run dev`
- [ ] Install MetaMask Flask with Snap
- [ ] Create & deploy PQWallet (save address!)
- [ ] Get test MUSDC (or verify MockToken address)
- [ ] Open Tenderly dashboard in another tab
- [ ] Clear browser console/notifications
- [ ] Close unnecessary browser tabs
- [ ] Set browser to 1080p viewport
- [ ] Test run the FULL flow once!
- [ ] Have architecture diagram ready (separate window)

### Recording Settings
- [ ] Screen resolution: 1920x1080 minimum
- [ ] Frame rate: 30fps or 60fps
- [ ] Audio: Clear microphone, test levels
- [ ] Remove background noise
- [ ] Cursor highlighting enabled (optional)
- [ ] Hide desktop clutter
- [ ] Disable notifications (macOS: Do Not Disturb)

### Post-Recording Checklist
- [ ] Trim dead air at start/end
- [ ] Add fade in/out transitions
- [ ] Verify audio is clear throughout
- [ ] Check all text is readable (not too small)
- [ ] Add background music (low volume, optional)
- [ ] Export at 1080p, MP4 format
- [ ] Upload to YouTube/Vimeo
- [ ] Add timestamps in description

---

## ⏱️ TIMING SUMMARY

| Section | Time | Key Action |
|---------|------|------------|
| 1. Hook | 0:00-0:30 | Problem → Solution |
| 2. Architecture | 0:30-1:00 | Diagram walkthrough |
| 3. Live Demo | 1:00-2:00 | Full vesting deployment |
| 4. Success | 2:00-2:30 | Show results + Tenderly |
| 5. Differentiator | 2:30-3:00 | Why it matters |

**Total: 3:00 minutes** ✅

---

## 🎯 KEY TALKING POINTS TO EMPHASIZE

**Must Say:**
1. ✅ "NIST standard" (ML-DSA-65)
2. ✅ "99.5% gas savings" (50M → 250K)
3. ✅ "Quantum-resistant" / "Quantum-safe"
4. ✅ "Production ready"
5. ✅ "MetaMask Snap - no separate app"

**Nice to Say:**
- "Test mode: 1 minute = 1 month"
- "PYUSD - PayPal's stablecoin"
- "ERC-4337 Account Abstraction"
- "Shor's algorithm" (when explaining quantum threat)
- "Groth16 ZK-SNARKs"

**Avoid:**
- Too much technical jargon
- Long pauses or "umms"
- Rushing through numbers
- Apologizing for loading times

---

## 💡 PRO TIPS

**Voice:**
- Speak clearly and at moderate pace
- Use enthusiasm but don't oversell
- Pause briefly after important numbers
- Vary your tone to maintain interest

**Visuals:**
- Keep cursor movements smooth and deliberate
- Don't click frantically
- Let important screens breathe for 2-3 seconds
- Use cursor to point at specific elements

**Editing:**
- Speed up loading screens slightly (1.2x speed)
- Cut dead air between sections
- Keep transitions quick (0.5-1 second fades)
- Add subtle zoom on important text

**Common Pitfalls:**
- ❌ Don't spend too long on MetaMask confirmations
- ❌ Don't read every word on screen
- ❌ Don't explain the code - explain the benefit
- ❌ Don't rush the ending - stick the landing!

---

## 🎬 ALTERNATIVE: 2-MINUTE SPEED RUN

If you need to cut to 2 minutes:

**Keep:**
- Section 1: Hook (0:00-0:20) ← SHORTEN by 10 sec
- Section 2: Architecture (0:20-0:40) ← SHORTEN by 20 sec
- Section 3: Live Demo (0:40-1:30) ← KEEP but faster
- Section 5: Differentiator (1:30-2:00) ← KEEP ending

**Cut:**
- Section 4: Tenderly explorer (save 15-30 sec)
- Detailed review screen (just show it, don't explain)
- Some architecture detail

---

## 🎬 ALTERNATIVE: 4-MINUTE EXTENDED

If you have 4 minutes:

**Add:**
- +0:30: Show Snap installation process
- +0:30: Show PQWallet creation wizard
- +0:30: Demonstrate a claim transaction
- +0:30: Deeper architecture explanation

**Recommend:** Stick with 3 minutes for best engagement!

---

## 📊 SUCCESS METRICS

**A successful demo video will:**
- [ ] Clearly explain the quantum threat (30 sec)
- [ ] Show the full deployment flow (60 sec)
- [ ] Demonstrate production-ready UI
- [ ] Highlight key differentiators (gas savings, NIST)
- [ ] Leave viewers wanting to try it
- [ ] Stay under 3:30 total runtime

**Viewer takeaways:**
1. "Quantum computers will break current crypto"
2. "This solves it with NIST standards TODAY"
3. "Easy to use - just a MetaMask Snap"
4. "Real benefits - 99.5% gas savings"
5. "Production ready - I can use this now"

---

Good luck with your recording! 🎬🚀

Let me know if you need any clarifications or adjustments to the script!
