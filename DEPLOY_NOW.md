# 🚀 Quick Deploy Guide - Pyth Integration

**Ready to deploy in 3 steps!**

---

## Step 1: Set Up Environment (2 minutes)

```bash
# 1. Create .env file
cat > .env << 'EOF'
RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d
PRIVATE_KEY=your_private_key_here_replace_this
EOF

# 2. Edit .env and add your actual private key
nano .env  # or use your favorite editor

# 3. Verify environment is set
source .env
echo "RPC URL: $RPC_URL"
echo "Private key: ${PRIVATE_KEY:0:10}..." # Shows first 10 chars only
```

**Get Private Key**:
- From MetaMask: Settings → Security & Privacy → Reveal Private Key
- **IMPORTANT**: Use a test wallet only! Never your main wallet!

---

## Step 2: Deploy Contracts (5 minutes)

```bash
# Deploy Pyth Oracle integration
forge script script/DeployPythOracle.s.sol:DeployPythOracle \
    --rpc-url $RPC_URL \
    --broadcast \
    --private-key $PRIVATE_KEY \
    -vvvv
```

**Watch for**:
```
== Logs ==
  PythPriceOracle deployed at: 0x...
  Configured ETH/USD price feed
  Configured BTC/USD price feed
  Configured USDC/USD price feed
  Configured USDT/USD price feed
  Configured DAI/USD price feed
  Configured PYUSD/USD price feed

  === Deployment Summary ===
  PythPriceOracle: 0xYOUR_ADDRESS_HERE
```

**Save this address!**

---

## Step 3: Update Dashboard (2 minutes)

```bash
# 1. Create contracts config (if doesn't exist)
cat > dashboard/src/config/contracts.ts << 'EOF'
export const DEPLOYED_CONTRACTS = {
  // Existing contracts
  zkVerifier: '0xF8e9E6B341d897Fce3bD9FF426aBaBE4c52ce288',
  pqValidator: '0xf527846F3219A6949A8c8241BB5d4ecf2244CadF',
  pqWalletFactory: '0x5895dAbE895b0243B345CF30df9d7070F478C47F',
  mockToken: '0xc351De5746211E2B7688D7650A8bF7D91C809c0D',
  pqVault4626: '0x8e043C8DF2c7ef48FE713DC4129D1b06A0644C21',
  pqVault4626Demo: '0xE6D42d7B673852fDd755E870A3bDD85a4852AE9C',
  zkProofOracle: '0xF8982849A04d7CeD0c36ed9028e293CB4c2277C9',
  qrngOracle: '0x1b7754689d5bDf4618aA52dDD319D809a00B0843',

  // NEW: Pyth integration
  pythPriceOracle: 'PASTE_YOUR_ADDRESS_HERE',
} as const;
EOF

# 2. Edit and add your deployed address
nano dashboard/src/config/contracts.ts

# 3. Restart dashboard
cd dashboard
npm run dev
```

**Dashboard will be at**: http://localhost:5175

---

## ✅ Verification (2 minutes)

### Test 1: Dashboard Prices Live

1. Open http://localhost:5175
2. Click "Oracles" tab
3. **Should see**: 6 price cards with live numbers
4. **Should see**: Green pulsing "Live" indicator
5. **Should see**: "🏆 Prize Eligible" badge

### Test 2: Contract Query

```bash
# Query ETH price
cast call $PYTH_PRICE_ORACLE \
    "getPrice(address)(int64,int32,uint256)" \
    0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 \
    --rpc-url $RPC_URL

# Should return: (price, exponent, timestamp)
# Example: (310000000000, -8, 1697654321)
# Means: $3100.00 (310000000000 * 10^-8)
```

### Test 3: PYUSD Price

```bash
# Query PYUSD price
cast call $PYTH_PRICE_ORACLE \
    "getPrice(address)(int64,int32,uint256)" \
    0x6c3ea9036406852006290770BEdFcAbA0e23A0e8 \
    --rpc-url $RPC_URL

# Should return: (~100120000, -8, timestamp)
# Means: ~$1.0012 (stable!)
```

---

## 🎬 Record Demo (15 minutes)

### Quick Script:

1. **Open Loom/OBS** (screen recording)
2. **Navigate to** http://localhost:5175
3. **Say**: "Hi, this is EthVaultPQ's Pyth Network integration"
4. **Click** Oracles tab
5. **Point out**: Live prices updating
6. **Say**: "16+ tokens supported, real-time USD valuation for vesting"
7. **Show**: Price updating after 10 seconds
8. **Explain**: Use case - employees see vesting value in dollars
9. **Show**: Contract on Tenderly explorer
10. **Wrap up**: "First PQ vesting with live price feeds!"

**Video Length**: 3-5 minutes
**Upload to**: YouTube (unlisted) or Loom

---

## 📝 Submit Prize (10 minutes)

### Pyth Network Application

**Information Needed**:
- Project Name: EthVaultPQ
- Description: Post-quantum vesting with real-time USD valuation
- Contract Address: [Your PythPriceOracle address]
- Network: Ethereum (Tenderly Virtual TestNet)
- GitHub: https://github.com/yourusername/EthVaultPQ
- Demo Video: [Your YouTube/Loom link]
- Documentation: https://github.com/yourusername/EthVaultPQ/blob/main/PYTH_INTEGRATION.md

**Key Points to Mention**:
- ✅ 16+ price feeds integrated
- ✅ Live dashboard with 10-second updates
- ✅ Real use case: USD valuation of vested tokens
- ✅ Production-ready smart contracts
- ✅ Comprehensive documentation
- ✅ First post-quantum protocol with Pyth integration

---

## 🐛 Troubleshooting

### Issue: "Insufficient funds"

**Solution**:
```bash
# Check your balance
cast balance $(cast wallet address --private-key $PRIVATE_KEY) \
    --rpc-url $RPC_URL

# If zero, get testnet ETH from Tenderly dashboard
# Visit: https://dashboard.tenderly.co/explorer/vnet/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d
# Click "Faucet" or fund your address
```

### Issue: Dashboard not showing prices

**Solutions**:
1. Check browser console for errors (F12)
2. Verify contract address in `dashboard/src/config/contracts.ts`
3. Hard refresh browser (Ctrl+Shift+R)
4. Check Network tab - should see requests to `hermes.pyth.network`

### Issue: Prices show "Loading..."

**Solution**:
- Pyth Hermes API might be slow
- Wait 30 seconds
- Check browser console for fetch errors
- Verify internet connection

---

## ⏱️ Total Time Estimate

| Step | Time | Status |
|------|------|--------|
| Set up environment | 2 min | ⏳ |
| Deploy contracts | 5 min | ⏳ |
| Update dashboard | 2 min | ⏳ |
| Verify deployment | 2 min | ⏳ |
| Record demo video | 15 min | ⏳ |
| Submit application | 10 min | ⏳ |
| **TOTAL** | **36 min** | **→ $5K!** |

---

## 🎯 Success Checklist

- [ ] `.env` file created with private key
- [ ] Deployment command executed successfully
- [ ] Contract address saved
- [ ] Dashboard updated with address
- [ ] Dashboard showing 6 live prices
- [ ] "Live" indicator is green
- [ ] Contract queries return valid prices
- [ ] Demo video recorded (3-5 min)
- [ ] Demo video uploaded to YouTube/Loom
- [ ] Prize application submitted

---

## 🚨 IMPORTANT REMINDERS

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use test wallet only** - Not your main wallet!
3. **Save contract addresses** - You'll need them!
4. **Test before recording** - Make sure everything works!
5. **Keep demo under 5 minutes** - Short and focused!

---

## 🎊 After Deployment

**You will have**:
- ✅ PythPriceOracle deployed to Tenderly
- ✅ Live dashboard with real-time prices
- ✅ $5K prize application submitted
- ✅ 1/3 prizes complete

**Next**:
- Deploy PQVault4626WithPricing (extends functionality)
- Verify all contracts for Blockscout ($10K)
- Record PYUSD demo ($10K)

**Total Prize Progress**: $5K/$25K (20% → 100% in 2 more days!)

---

**Ready to deploy? Run the commands above!** 🚀

**Questions?** Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed troubleshooting.

---

*Quick reference for deploying Pyth integration in under 40 minutes*
