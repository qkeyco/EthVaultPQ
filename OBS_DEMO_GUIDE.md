# EthVaultPQ Demo - OBS Recording Guide
## With Background Removal & Professional Setup

**Duration:** ~3 minutes
**Tools:** OBS Studio, Chrome, MetaMask

---

## 🎥 OBS Setup (Do This First)

### Scene 1: "Browser Only" (Main Demo)
1. **Add Source:** Browser Window Capture
   - Window: Chrome (localhost:5175)
   - Capture Method: Window Capture
   - Resolution: 1920x1080

### Scene 2: "Picture-in-Picture" (Optional - for talking head)
1. **Add Source:** Video Capture Device (your webcam)
   - Apply Filter: "Background Removal" (if available)
   - Or use "Chroma Key" with green screen
   - Position: Bottom right corner, ~300x300px
2. **Add Source:** Browser Window Capture (same as Scene 1)

### Audio Setup
- **Microphone:** Your preferred mic
- **Desktop Audio:** Enabled (to capture any sound effects)
- **Test levels:** Speak normally, aim for -12dB to -6dB

### Recording Settings
- **Format:** MP4 or MOV
- **Quality:** High (1080p60 or 1080p30)
- **Encoder:** Hardware (if available) or x264

---

## 🎬 Recording Checklist

### Before You Hit Record:

- [ ] OBS is open with "Browser Only" scene selected
- [ ] Chrome is open at `http://localhost:5175`
- [ ] You're logged into Chrome as james.tagg@valiscorp.com
- [ ] MetaMask extension is visible and unlocked
- [ ] Snap is **uninstalled** (fresh demo)
- [ ] Dashboard is on the Snap tab
- [ ] Audio levels are good
- [ ] Webcam positioned (if using PIP)
- [ ] Background removed/blurred

### Quick Test:
1. Click Start Recording
2. Say "Testing 1, 2, 3"
3. Move your mouse on screen
4. Stop Recording
5. Check the file plays correctly
6. Delete test file

---

## 🎭 Demo Script (Follow Along While Recording)

### SCENE 1: Introduction (0:00 - 0:15)

**🎥 ACTION:** Start OBS Recording

**📍 ON SCREEN:** Dashboard homepage at localhost:5175

**🎤 NARRATION:**
"Welcome to EthVaultPQ - the first production-ready post-quantum wallet for Ethereum. I'm going to show you how to install the Snap, create quantum-resistant keys, and sign a message with real Dilithium3 cryptography."

**⏱️ TIMING:** 15 seconds

---

### SCENE 2: Install MetaMask Snap (0:15 - 0:45)

**📍 ON SCREEN:** Click "Snap" tab

**🎤 NARRATION:**
"First, let's install the MetaMask Snap. This Snap uses NIST-approved ML-DSA-65, also known as Dilithium3 - a post-quantum signature algorithm that's secure even against quantum computers."

**🖱️ ACTIONS:**
1. Click "Connect Snap" button
2. Wait for MetaMask popup

**⏸️ PAUSE FOR METAMASK:** (Keep recording!)

**🎤 NARRATION (while approving):**
"MetaMask is asking me to connect and approve the Snap installation. I'll click Connect... and then Approve & Install."

**🖱️ ACTIONS:**
3. Click "Connect" in MetaMask
4. Click "Approve & Install"
5. Wait for success

**🎤 NARRATION (after approval):**
"Great! The Snap is now installed."

**⏱️ TIMING:** 30 seconds (includes MetaMask approval time)

---

### SCENE 3: Create Post-Quantum Keys (0:45 - 1:15)

**📍 ON SCREEN:** "Create PQ Keys" button visible

**🎤 NARRATION:**
"Now let's generate our post-quantum keypair. This will create a 1952-byte public key and a 4032-byte secret key."

**🖱️ ACTIONS:**
1. Click "Create PQ Keys"
2. Wait for MetaMask popup

**⏸️ PAUSE FOR METAMASK:**

**🎤 NARRATION (while approving):**
"I'll approve the key generation in MetaMask..."

**🖱️ ACTIONS:**
3. Click "Approve" in MetaMask
4. Wait for keys to appear

**🎤 NARRATION (after keys appear):**
"Perfect! Here's our post-quantum public key. Notice it's displayed in hexadecimal format. This is a real Dilithium3 key - quantum computers cannot derive the private key from this public key."

**💡 TIP:** Hover mouse over the public key to highlight it

**⏱️ TIMING:** 30 seconds

---

### SCENE 4: Sign a Message (1:15 - 1:50)

**📍 ON SCREEN:** Scroll to message section

**🎤 NARRATION:**
"Now let's sign a message to demonstrate the post-quantum signature."

**🖱️ ACTIONS:**
1. Scroll to textarea
2. Click in textarea
3. Type: "Hello, Post-Quantum World! 🔐"

**🎤 NARRATION (while typing):**
"I'll type a simple message... 'Hello, Post-Quantum World'"

**🖱️ ACTIONS:**
4. Click "Sign Message"
5. Wait for MetaMask popup

**⏸️ PAUSE FOR METAMASK:**

**🎤 NARRATION (while approving):**
"Approving the signature request..."

**🖱️ ACTIONS:**
6. Click "Approve" in MetaMask
7. Wait for signature to appear

**🎤 NARRATION (after signature appears):**
"And there's our Dilithium3 signature! Notice the size - 3309 bytes. This is the exact size specified in the NIST standard for ML-DSA-65. Unlike ECDSA signatures which are around 64 bytes, post-quantum signatures are larger - but that's the price we pay for quantum resistance."

**💡 TIP:** Hover mouse over the signature to highlight it

**⏱️ TIMING:** 35 seconds

---

### SCENE 5: ZK-SNARK Context (1:50 - 2:20) [OPTIONAL]

**📍 ON SCREEN:** Still showing signature

**🎤 NARRATION:**
"Now, 3309 bytes might not sound like much, but on Ethereum, verifying a signature this large would cost about 50 million gas - more than an entire block! That's where ZK-SNARKs come in."

**🎤 NARRATION (continue):**
"We've built a ZK-SNARK oracle that verifies the signature off-chain and generates a compact proof - just 300 bytes - that costs only 250 thousand gas to verify on-chain. That's a 99.5% gas savings, making post-quantum signatures practical for Ethereum."

**💡 TIP:** You could show a graphic here comparing:
- Direct: 50M gas ❌
- ZK-SNARK: 250K gas ✅

**⏱️ TIMING:** 30 seconds

---

### SCENE 6: Conclusion (2:20 - 2:40)

**📍 ON SCREEN:** Scroll back to top of page

**🎤 NARRATION:**
"EthVaultPQ combines real post-quantum cryptography with zero-knowledge proofs to bring quantum-resistant security to Ethereum - today, not tomorrow."

**🎤 NARRATION (continue):**
"The code is open source, the cryptography is NIST-approved, and it's all production-ready. Visit ethvault.qkey.co to learn more and try it yourself."

**🖱️ ACTIONS:**
1. Scroll to top
2. Hover over logo/title

**⏱️ TIMING:** 20 seconds

---

**🛑 Stop Recording**

**TOTAL TIME:** ~2:40

---

## ✂️ Post-Production Tips

### Quick Edits in OBS or DaVinci Resolve:

1. **Trim the start/end** - Remove any dead air
2. **Add lower thirds** - Your name, title
3. **Add text overlays** for key stats:
   - "3309 bytes = Dilithium3 signature"
   - "99.5% gas savings with ZK-SNARKs"
   - "NIST ML-DSA-65 compliant"
4. **Add transitions** - Simple fades between major sections
5. **Background music** - Subtle tech music at -20dB

### Key Moments to Highlight:
- ✨ Snap installation success
- ✨ Public key appearing
- ✨ Signature generation

### Export Settings:
- **Resolution:** 1920x1080
- **Frame Rate:** 30fps (or 60fps if you recorded at 60)
- **Format:** MP4 (H.264)
- **Bitrate:** 8-10 Mbps

---

## 🎯 Pro Tips

### For a Polished Look:

1. **Clean your browser:**
   - Hide bookmarks bar (Cmd+Shift+B)
   - Close unnecessary tabs
   - Full screen mode (F11) or hide Chrome UI

2. **Mouse movements:**
   - Move slowly and deliberately
   - Pause briefly before clicking
   - Avoid erratic movements

3. **Pacing:**
   - Speak clearly and not too fast
   - Pause between sections
   - Don't rush through MetaMask approvals

4. **If you make a mistake:**
   - Just pause, take a breath
   - Restart from the beginning of that scene
   - Cut it out in post-production

5. **Energy:**
   - Smile (it shows in your voice!)
   - Be enthusiastic but not over the top
   - Sound confident about the tech

---

## 🔄 If You Need Multiple Takes

**Quick Reset:**
```bash
# 1. Uninstall Snap in MetaMask
# 2. Refresh browser (Cmd+R)
# 3. Ready for another take!
```

**Keep the best take** of each section and edit them together.

---

## 📊 Recording Metrics

Your final video should be:
- **Length:** 2-3 minutes
- **File Size:** ~50-100 MB (at 1080p)
- **Resolution:** 1920x1080
- **Quality:** Professional, clear, smooth

---

## ✅ Final Checklist Before Recording

- [ ] OBS recording settings configured
- [ ] Audio levels tested
- [ ] Background removed/blurred (if using webcam)
- [ ] Chrome window clean and ready
- [ ] Dashboard at localhost:5175
- [ ] MetaMask unlocked
- [ ] Snap uninstalled (fresh demo)
- [ ] Script printed or on second monitor
- [ ] Water nearby (for your voice!)
- [ ] Phone on silent
- [ ] Notifications turned off

---

**You've got this!** 🚀

Remember: The tech is impressive, you just need to show it working. Even if you need a few takes, that's totally normal. The final edited video will look great!

---

## 🎬 Ready?

1. Open OBS
2. Open Chrome to localhost:5175
3. Read through the script once more
4. Take a deep breath
5. Hit that record button!
6. Have fun! 😊
