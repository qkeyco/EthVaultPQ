# EthVaultPQ Dashboard

Post-quantum secure smart contract protocol dashboard for Ethereum.

## Features

- **Deploy Tab** - Deploy and manage all EthVaultPQ contracts
- **Wallet Management** - Create and manage post-quantum wallets (ERC-4337)
- **Vesting** - Create and manage vesting schedules (ERC-4626)
- **Oracles** - Interact with ZK Proof and QRNG oracles
- **Network Support** - Tenderly Ethereum, Sepolia, Mainnet (after audit)

## Quick Start

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure for Tenderly Ethereum:

```bash
# Set default network to Tenderly
VITE_NETWORK=tenderly

# Add your Tenderly RPC URL (from dashboard.tenderly.co)
VITE_TENDERLY_RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/YOUR_FORK_ID
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Network Configuration

### Tenderly Ethereum Virtual TestNet (PRIMARY)

This is the primary test network for EthVaultPQ.

**Setup:**
1. Go to [dashboard.tenderly.co](https://dashboard.tenderly.co)
2. Create a new Virtual TestNet
3. Select "Ethereum Mainnet" as the base network
4. Copy the RPC URL
5. Add it to `.env.local` as `VITE_TENDERLY_RPC_URL`

**Why Tenderly?**
- Safe testing environment
- Transaction simulation
- Time travel (for vesting tests)
- Full debugging tools
- No real ETH required

### Sepolia Testnet

After Tenderly validation, deploy to Sepolia for public testing.

**Setup:**
1. Get Sepolia RPC from Infura or Alchemy
2. Add to `.env.local` as `VITE_SEPOLIA_RPC_URL`
3. Get Sepolia ETH from faucets

### Ethereum Mainnet

**WARNING:** Mainnet deployment is DISABLED until professional security audit is complete.

Do not enable mainnet deployment without:
- Professional audit from Trail of Bits / OpenZeppelin
- 30+ days of testnet validation
- Bug bounty program

## Deploy Tab

The Deploy Tab is the primary feature for deploying contracts.

### Deployment Order

Contracts must be deployed in this order (enforced by UI):

1. **Groth16Verifier** - ZK-SNARK verifier
2. **PQValidator** - Post-quantum validator (requires Groth16Verifier)
3. **PQWalletFactory** - Wallet factory (requires PQValidator)
4. **MockToken** - ERC-20 for testing
5. **PQVault4626** - Vesting vault (requires MockToken)
6. **PQVault4626Demo** - Fast-forward vesting demo (requires MockToken)
7. **ZKProofOracle** - ZK proof oracle (requires Groth16Verifier)
8. **QRNGOracle** - Quantum RNG oracle

### Features

- **Network Selection** - Switch between Tenderly, Sepolia, Mainnet
- **Deployment Progress** - Visual progress bar
- **Status Tracking** - Real-time deployment status
- **Verification** - Auto-verify contracts on deployment
- **Testing** - Quick test buttons for each contract

## Vesting Demo Mode

The dashboard includes a demo mode for vesting that fast-forwards time.

**1 month per minute** - demonstrate vesting without waiting!

### How it works:

- **Demo Contract**: Special `PQVault4626Demo` with accelerated block calculations
- **Fast-Forward UI**: Buttons to skip ahead 1 month, 3 months, 6 months, 1 year
- **Real-time Updates**: Watch vesting unlock in real-time

### Setup:

1. Deploy `PQVault4626Demo` contract
2. Enable demo mode in the Vesting tab
3. Use fast-forward controls
4. See vesting unlock immediately!

## Development

### Project Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── DeployTab.tsx          # NEW: Deploy Tab component
│   │   ├── WalletCreator.tsx      # Wallet creation
│   │   ├── VaultManager.tsx       # Vesting management
│   │   └── ...
│   ├── config/
│   │   ├── networks.ts            # Network configurations
│   │   ├── contracts.ts           # Contract addresses
│   │   └── wagmi.ts               # Wagmi config
│   ├── App.tsx                    # Main app with tabs
│   └── main.tsx                   # Entry point
├── .env.example                   # Example environment config
└── package.json
```

### Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

### Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Wagmi** - Ethereum React hooks
- **RainbowKit** - Wallet connection
- **TailwindCSS** - Styling
- **TypeScript** - Type safety

## Deployment

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

### Environment Variables

Make sure to set all environment variables in your production environment:

- `VITE_NETWORK` - Network to use
- `VITE_TENDERLY_RPC_URL` - Tenderly RPC URL
- `VITE_ZK_API_URL` - ZK Proof API URL

## Testing Checklist

Before deploying to mainnet, complete this checklist:

### Tenderly Ethereum (Week 1-2)
- [ ] Deploy all 8 contracts
- [ ] Verify all contracts
- [ ] Create test wallet
- [ ] Create vesting schedule
- [ ] Test vesting demo (fast-forward)
- [ ] Request ZK proof
- [ ] Request random number
- [ ] Test emergency pause
- [ ] Test access controls

### Sepolia (Week 3-4)
- [ ] Deploy all contracts
- [ ] Verify on Etherscan
- [ ] Public testing
- [ ] Community feedback
- [ ] Bug fixes

### Professional Audit (Month 2-3)
- [ ] Engage Trail of Bits or OpenZeppelin
- [ ] Complete audit
- [ ] Fix findings
- [ ] Re-audit if needed

### Mainnet Preparation (Month 4-5)
- [ ] Bug bounty program
- [ ] Final testing
- [ ] Deployment plan
- [ ] Multi-sig setup

## Troubleshooting

### Contract deployment fails

- Check you have ETH for gas
- Verify network is correct
- Check contract dependencies are deployed

### Network not connecting

- Verify RPC URL is correct
- Check Tenderly fork is active
- Try switching networks

### UI not updating

- Clear browser cache
- Restart dev server
- Check console for errors

## Support

- **Documentation**: See main project README
- **Issues**: Report at GitHub Issues
- **Audit Reports**: See `/docs/audits/`

## Security

**WARNING:** This is experimental software.

- ✅ Testnet ready
- 🔴 NOT mainnet ready (requires audit)
- 🔐 Pure post-quantum (no ECDSA fallback)
- ✅ NIST ML-DSA/SLH-DSA compliant

## License

MIT License - see main project LICENSE file.

---

**Last Updated:** October 17, 2025
**Status:** Testnet Ready
**Next Milestone:** Tenderly Deployment
