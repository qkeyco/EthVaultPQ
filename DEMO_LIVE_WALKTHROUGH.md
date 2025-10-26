# EthVaultPQ - 3 Minute Live Website Demo
## No Slides - Just the Dashboard

---

## 🎬 STRATEGY: Website Walkthrough

**What you'll show:**
- Just the live dashboard at http://localhost:5175
- Navigate through the actual UI
- Talk through features as you demo them
- Show real transactions happening

**Why this works better:**
- More authentic and engaging
- Shows the actual product working
- No context switching between slides and demo
- Viewers see what they'd actually use

---

## 📋 PRE-RECORDING CHECKLIST

### Before You Start Recording:

1. **Install & Setup** (DO THESE BEFORE RECORDING!)
   - [ ] Install MetaMask Flask
   - [ ] Install Snap: `npm:@qkey/ethvaultpq-snap`
   - [ ] Generate PQWallet in Snap
   - [ ] Deploy PQWallet to Tenderly
   - [ ] Note down your PQWallet address

2. **Get Ready to Record**
   - [ ] Start dashboard: `cd dashboard && npm run dev`
   - [ ] Open http://localhost:5175 in browser
   - [ ] Connect wallet (top-right corner)
   - [ ] Open Tenderly in another tab (ready to switch)
   - [ ] Clear browser notifications
   - [ ] Close unnecessary tabs
   - [ ] Test the full flow once!

3. **Screen Setup**
   - [ ] Browser window maximized
   - [ ] Hide bookmarks bar
   - [ ] Zoom level at 100%
   - [ ] Clear console (F12 → close)

---

## 🎯 3-MINUTE SCRIPT: WEBSITE WALKTHROUGH

### [0:00-0:30] THE HOOK & HOMEPAGE

**Screen:** Browser at dashboard homepage

**Script:**
```
"Hey everyone. Traditional crypto wallets use ECDSA signatures
that quantum computers will break using Shor's algorithm.

EthVaultPQ solves this TODAY with Dilithium3 - a NIST-approved
post-quantum signature scheme.

This is a complete quantum-safe vesting system for PayPal USD,
integrated right into MetaMask as a Snap.

Let me show you how it works."
```

**Actions:**
- Show homepage briefly (5 sec)
- Mouse over "Vesting" tab
- Quick pan across the UI

**Time:** 30 seconds

---

### [0:30-1:00] EXPLAIN THE FLOW (WHILE NAVIGATING)

**Screen:** Click into Vesting tab

**Script:**
```
"Here's how the complete flow works:

[Point to green "Quick Demo Mode" box]
First, I generate Dilithium3 quantum-resistant keys in a MetaMask
Snap - that's already done.

[Scroll down slightly]
Then I deploy a PQWallet - an ERC-4337 smart contract wallet
that only accepts quantum-resistant signatures. Also done.

[Point to form]
Now I'll create a vesting schedule: lock up 100,000 PYUSD tokens
for 60 months, vesting to my quantum-safe wallet.

[Point to test mode indicator]
I'm using test mode where 1 minute equals 1 month, so we can
actually see this work.

Let's do it."
```

**Actions:**
- Click "Vesting" tab
- Page loads
- Point to Quick Demo Mode box
- Scroll to show form
- Point to "Test Mode" indicator

**Time:** 30 seconds (talk while page is loading)

---

### [1:00-1:15] LOAD DEMO SCHEDULE

**Screen:** Vesting Schedule Builder

**Script:**
```
"I'll use the quick demo to pre-fill everything.
One click loads 100,000 PYUSD, 60-month linear vesting,
starting in one minute."
```

**Actions:**
- Click "Load Demo Schedule" button
- Alert pops up: "Demo schedule loaded!"
- Close alert
- Show filled form:
  - Total Amount: 100,000 MUSDC
  - 60-Month Linear preset
  - Test Mode active
  - Start date (1 min from now)

**Pace:** Quick - 15 seconds

---

### [1:15-1:30] BENEFICIARY - SHOW PQWALLET

**Screen:** Click "Continue to Recipients"

**Script:**
```
"The beneficiary is my quantum-safe PQWallet.
Notice these security badges - Dilithium3, ML-DSA-65.
That's the NIST standard for quantum resistance."
```

**Actions:**
- Click "Continue to Recipients →"
- Page loads showing PQWallet Setup
- Green box visible: "✅ PQWallet Ready!"
- Point to:
  - PQWallet address
  - "Dilithium3 quantum-resistant signatures"
  - Security badges

**Emphasize:** The green checkmarks and "quantum-resistant" text

**Time:** 15 seconds

---

### [1:30-1:45] REVIEW

**Screen:** Click through to Review

**Script:**
```
"I'll skip the vault setup and go straight to review.
Here's the complete setup - quantum-safe wallet as beneficiary,
100,000 tokens vesting over 60 months."
```

**Actions:**
- Click "Continue to Vault Setup →"
- Click "Skip" or "Back" (whatever works)
- Or just click "Continue to Review" if that button exists
- Review page loads
- Pan down showing:
  - Schedule summary
  - Beneficiary (PQWallet) with badges
  - Timeline graph (briefly)

**Time:** 15 seconds (move quickly here)

---

### [1:45-2:15] DEPLOY - THE MONEY SHOT

**Screen:** Click "Continue to Deploy"

**Script:**
```
"Now the actual deployment. This is a two-step process.

[Step 1 appears]
First, approve the token spending...
[Click button, MetaMask pops up]
Confirming...
[Wait for confirmation]
Approved!

[Step 2 activates]
Now creating the vesting schedule on-chain...
[Click Create Vesting button]
Signing with my quantum-safe wallet...
[Wait for confirmation]

And... done! The vesting schedule is live."
```

**Actions:**
1. Click "Continue to Deploy →" (2 sec)
2. Deploy page shows 2 steps (2 sec)
3. Click "✓ Approve Tokens" (2 sec)
4. MetaMask popup → Confirm (3 sec)
5. Wait for "✓ Approval confirmed!" (5 sec)
6. Click "🚀 Create Vesting" (2 sec)
7. MetaMask confirm (2 sec)
8. Wait for "✓ Vesting schedule created!" (7 sec)
9. Success message appears (5 sec)

**Important:**
- Don't rush the waiting periods - let people see it's real
- Talk through what's happening while waiting
- Show genuine excitement when it succeeds

**Time:** 30 seconds

---

### [2:15-2:35] SUCCESS & TENDERLY

**Screen:** Success page, then Tenderly

**Script:**
```
"Success! 100,000 PYUSD locked in a quantum-safe vesting schedule.
The beneficiary is my PQWallet protected by Dilithium3 signatures.

[Show Tenderly link]
Let me show you this on Tenderly...

[Switch to Tenderly tab]
Here's the transaction - you can see the vesting schedule deployed,
the beneficiary is my quantum-resistant wallet address.
All secured against quantum computers."
```

**Actions:**
- Show success screen (5 sec)
  - Schedule ID
  - Stats (recipients, amount, duration)
  - Security badges
- Click "View on Tenderly →" (2 sec)
- Switch to Tenderly dashboard (3 sec)
- Show transaction details (5 sec)
- Point to VestingScheduleCreated event (3 sec)
- Quick pan (2 sec)

**Time:** 20 seconds

---

### [2:35-3:00] THE CLOSER

**Screen:** Switch back to dashboard OR stay on Tenderly

**Script:**
```
"So here's what makes this special:

It uses Dilithium3 - the NIST standard for post-quantum
cryptography. Not experimental, production-grade crypto.

The signatures are verified using ZK-SNARKs, which saves
99.5% on gas costs. That's 50 million gas down to 250,000.

It's integrated into MetaMask as a Snap - no separate app,
no new seed phrase, just install and use.

And it's supporting real assets - PYUSD, PayPal's stablecoin,
for actual employee vesting and tax withholding.

This is production ready, deployed on Tenderly Ethereum today,
and ready for mainnet after audits.

The future of crypto security is here - quantum-safe vesting
you can use right now."
```

**Actions:**
- Switch back to dashboard (or stay on Tenderly)
- Mouse over logo
- Slow zoom on the UI (last 5 seconds)
- Fade to black

**Pacing:**
- Speak clearly and confidently
- Pause briefly after key stats (99.5%, NIST, etc.)
- End with energy

**Time:** 25 seconds

---

## ⏱️ TIMING BREAKDOWN

| Time | Section | Action |
|------|---------|--------|
| 0:00-0:30 | Hook | Problem + Solution on homepage |
| 0:30-1:00 | Explain | Navigate to Vesting, explain flow |
| 1:00-1:15 | Load Demo | Click "Load Demo Schedule" |
| 1:15-1:30 | PQWallet | Show quantum-safe beneficiary |
| 1:30-1:45 | Review | Quick review screen |
| 1:45-2:15 | Deploy | 2-step deployment (THE MAIN EVENT) |
| 2:15-2:35 | Success | Show results + Tenderly |
| 2:35-3:00 | Closer | Why it matters |

**Total: 3:00** ✅

---

## 🎯 KEY TALKING POINTS

**MUST SAY:**
1. ✅ "Dilithium3" and "NIST standard"
2. ✅ "99.5% gas savings" (50M → 250K)
3. ✅ "Quantum-resistant" / "Quantum-safe"
4. ✅ "Production ready"
5. ✅ "MetaMask Snap"

**NUMBERS TO EMPHASIZE:**
- 100,000 PYUSD (real money, not toy tokens)
- 60 months (real vesting period)
- 99.5% gas reduction
- Test mode: 1 minute = 1 month (clever demo feature)

**TONE:**
- Confident but not arrogant
- Excited but not manic
- Technical but accessible
- Professional but personable

---

## 💡 PRO TIPS FOR LIVE WALKTHROUGH

### DO:
✅ **Talk while pages load** - Fill dead air with context
✅ **Use cursor to point** - "Notice this here..."
✅ **Acknowledge wait times** - "While this confirms..."
✅ **Show genuine reactions** - "And... yes! There it is."
✅ **Keep moving** - Don't linger too long on any screen

### DON'T:
❌ **Don't apologize** - No "sorry for the wait"
❌ **Don't read screens** - Explain, don't read
❌ **Don't rush** - Let important moments breathe
❌ **Don't go silent** - Always be talking
❌ **Don't hide errors** - If something breaks, acknowledge it

### HANDLING WAITS:
**During MetaMask confirmations:**
```
"While this confirms, I'll mention that these signatures
are verified using ZK-SNARKs off-chain, which is how we
get those massive gas savings..."
```

**During transaction confirmations:**
```
"This is deploying to Tenderly Ethereum right now.
In production, this same flow works on mainnet..."
```

---

## 🎬 BACKUP PLAN: If Something Breaks

**If MetaMask fails:**
```
"Looks like MetaMask needs a refresh - in production
this is seamless, but for the demo let me show you
what the success looks like..."
```
[Switch to Tenderly, show a pre-deployed example]

**If transaction fails:**
```
"Transaction didn't go through - that sometimes happens
on testnets. But you can see the UI flow is complete,
and here's what a successful deployment looks like..."
```
[Have a backup screenshot or previous successful deployment ready]

**Best Practice:**
- Do a full test run before recording
- Have Tenderly open with a backup successful transaction
- Record 2-3 takes so you have options

---

## 📊 SUCCESS CHECKLIST

After recording, your video should show:
- [ ] Clear problem statement (quantum threat)
- [ ] Live UI walkthrough (not slides)
- [ ] Actual deployment happening (not faked)
- [ ] Real transaction on Tenderly
- [ ] Key differentiators explained
- [ ] Confident, professional delivery
- [ ] Under 3:30 total runtime

**Viewer takeaways:**
1. ✅ "Quantum computers are a real threat"
2. ✅ "This uses NIST-approved standards"
3. ✅ "Easy to use - MetaMask integration"
4. ✅ "Production ready - I saw it work"
5. ✅ "I want to try this"

---

## 🚀 QUICK START: Recording Day

**30 minutes before:**
1. Install Snap + create PQWallet
2. Start dashboard
3. Test the full flow once
4. Clear notifications
5. Set up screen recording

**5 minutes before:**
1. Close everything except browser
2. Refresh dashboard
3. Connect wallet
4. Take a deep breath
5. Hit record

**During recording:**
1. Speak clearly and with energy
2. Point with cursor as you explain
3. Let key moments breathe
4. Show genuine enthusiasm
5. Stick the landing on the closer

**After recording:**
1. Watch it back once
2. Minor edits only (trim start/end)
3. Don't overthink it
4. Ship it! 🚀

---

## 📝 OPTIONAL: 2-Minute Speed Version

If you need to cut to 2 minutes:

**Keep:**
- Hook (0:00-0:20) - 20 sec
- Quick explain while loading demo (0:20-0:40) - 20 sec
- Show PQWallet beneficiary (0:40-0:50) - 10 sec
- Deploy both steps (0:50-1:30) - 40 sec
- Success (1:30-1:40) - 10 sec
- Closer (1:40-2:00) - 20 sec

**Cut:**
- Detailed review screen
- Tenderly explorer
- Extended architecture explanation

---

Good luck! Remember: energy, clarity, and authenticity beat perfection. 🎬

Show the real product working, talk through what makes it special, and let your enthusiasm show. You've got this! 🚀
