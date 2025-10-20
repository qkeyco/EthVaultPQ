# 🚀 Deployment Checklist

## Pre-Deployment ✓

- [x] All contracts written and tested
- [x] Deployment simulation successful
- [x] Documentation complete
- [x] Deployment script created (`deploy-pyth.sh`)
- [x] Dashboard ready

## Your Steps (15 minutes)

### 1. Get Private Key (2 min)
- [ ] Open MetaMask or create new wallet with `cast wallet new`
- [ ] Copy private key (keep it safe!)
- [ ] ⚠️ **Use test wallet only - never your main wallet!**

### 2. Configure Environment (1 min)
```bash
# Run the script - it will create .env
./deploy-pyth.sh

# Edit .env and add your private key
nano .env
```

- [ ] .env file created
- [ ] Private key added to .env
- [ ] Saved .env file

### 3. Fund Wallet (5 min if needed)
```bash
# The script will show your address
# Fund it at Tenderly dashboard if balance is 0
```

- [ ] Wallet address shown
- [ ] Balance checked
- [ ] Funded if needed (free testnet ETH)

### 4. Deploy Contracts (5 min)
```bash
# Run the deployment
./deploy-pyth.sh
```

Watch for:
```
✅ PythPriceOracle deployed at: 0x...
✅ Configured ETH/USD price feed
✅ Configured BTC/USD price feed
✅ Configured USDC/USD price feed
✅ Configured USDT/USD price feed
✅ Configured DAI/USD price feed
✅ Configured PYUSD/USD price feed
```

- [ ] Deployment started
- [ ] PythPriceOracle address received
- [ ] **SAVED CONTRACT ADDRESS**

### 5. Update Dashboard (2 min)
```bash
# Edit contracts config
nano dashboard/src/config/contracts.ts
```

Add your deployed address:
```typescript
pythPriceOracle: '0xYOUR_ADDRESS_HERE',
```

- [ ] contracts.ts updated
- [ ] Dashboard restarted

### 6. Test Deployment (2 min)
- [ ] Open http://localhost:5175
- [ ] Navigate to Oracles tab
- [ ] See 6 price cards (ETH, BTC, PYUSD, USDC, USDT, DAI)
- [ ] Prices showing (not "Loading...")
- [ ] "Live" indicator is green
- [ ] Prices update after 10 seconds

---

## Post-Deployment

### Contract Address
```
PythPriceOracle: 0x_________________________
```

### Verification
- [ ] Query price works: `cast call $PYTH_PRICE_ORACLE "getPrice(address)..."`
- [ ] Dashboard shows live prices
- [ ] No errors in browser console

---

## Next Steps

### Record Demo Videos (2-3 hours)

**Video 1: Pyth Integration** (5 min)
- [ ] Screen recording setup
- [ ] Show dashboard → Oracles tab
- [ ] Explain live prices
- [ ] Show vesting use case
- [ ] Upload to YouTube/Loom

**Video 2: Blockscout** (3 min)
- [ ] Show verified contracts
- [ ] Explain documentation
- [ ] Upload to YouTube

**Video 3: PayPal USD** (4 min)
- [ ] Show PYUSD price
- [ ] Explain stable vesting
- [ ] Upload to YouTube

### Submit Applications (1 hour)

**Pyth Network** ($5K)
- [ ] Fill application form
- [ ] Add contract address
- [ ] Link to GitHub repo
- [ ] Link to demo video
- [ ] Submit

**Blockscout** ($10K)
- [ ] Verify all 10 contracts
- [ ] Fill application form
- [ ] Add explorer links
- [ ] Link to demo video
- [ ] Submit

**PayPal USD** ($10K)
- [ ] Fill application form
- [ ] Show PYUSD integration
- [ ] Link to demo video
- [ ] Submit

---

## Timeline

| Task | Time | Total |
|------|------|-------|
| Deploy contracts | 15 min | 15 min |
| Record 3 videos | 2-3 hrs | ~3 hrs |
| Submit 3 apps | 1 hr | 4 hrs |
| **TOTAL** | | **~4 hours → $25K!** |

---

## Success Criteria

✅ **Deployment Success**:
- Contract deployed to Tenderly
- Address saved
- Dashboard showing live prices
- All tests passing

✅ **Prize Eligibility**:
- Demo videos uploaded
- Applications submitted
- Documentation linked
- GitHub repo public

---

## Troubleshooting

**Issue**: Script won't run
```bash
chmod +x deploy-pyth.sh
./deploy-pyth.sh
```

**Issue**: "Insufficient funds"
- Fund wallet at Tenderly dashboard
- Get free testnet ETH

**Issue**: Dashboard not showing prices
- Check browser console (F12)
- Verify contract address in config
- Hard refresh (Ctrl+Shift+R)

**Issue**: Deployment failed
- Check RPC_URL in .env
- Check PRIVATE_KEY in .env
- Check wallet has funds

---

## Resources

- **Deployment Guide**: `DEPLOY_NOW.md`
- **Full Documentation**: `DEPLOYMENT_GUIDE.md`
- **Status Tracker**: `DEPLOYMENT_STATUS.md`
- **Integration Guides**: 
  - `PYTH_INTEGRATION.md`
  - `BLOCKSCOUT_INTEGRATION.md`
  - `PAYPAL_USD_INTEGRATION.md`

---

**Ready?** Run: `./deploy-pyth.sh`

**Questions?** Check the guides above!

---

*Quick checklist for deploying and winning $25K in prizes*
