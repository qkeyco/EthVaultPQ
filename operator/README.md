# ZK Proof Oracle Operator Service

Automated service that listens for ProofRequested events from the ZKProofOracle contract and fulfills them by generating ZK-SNARK proofs off-chain.

## Overview

The operator service is the "glue" between on-chain proof requests and off-chain proof generation. It:

1. **Listens** for `ProofRequested` events from ZKProofOracle
2. **Fetches** request details (message, signature, publicKey)
3. **Calls** the proof generation API (Vercel)
4. **Submits** the generated proof back to the oracle on-chain

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ USER REQUEST                                                  │
│ ZKProofOracle.requestProof(message, signature, publicKey)    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ EVENT EMITTED                                                 │
│ ProofRequested(requestId, requester, msgHash, pkHash)        │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ OPERATOR SERVICE (This Service!)                             │
│ 1. Detects event                                              │
│ 2. Gets full request: oracle.getRequest(requestId)           │
│ 3. Calls API: POST /api/prove with message/signature/key     │
│ 4. Receives proof from API                                    │
│ 5. Submits: oracle.fulfillProof(requestId, proof)            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ PROOF VERIFICATION                                            │
│ Groth16VerifierReal.verifyProof(proof) → returns true        │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ USER CALLBACK                                                 │
│ user.handleProof(requestId, proof, publicSignals)            │
└──────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 20+
- ETH in operator wallet for gas
- Access to Tenderly RPC
- Deployed ZKProofOracle contract
- Running proof generation API

## Installation

```bash
cd operator
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:

```bash
# Tenderly RPC
TENDERLY_RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/YOUR_ID

# Deployed Contracts
ZK_ORACLE_ADDRESS=0x312D098B64e32ef04736662249bd57AEfe053750
GROTH16_VERIFIER_ADDRESS=0x1b7754689d5bDf4618aA52dDD319D809a00B0843

# Operator Wallet (needs ETH for gas)
OPERATOR_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# ZK Proof API
PROOF_API_URL=https://api.ethvault.qkey.co/api/prove
```

### Important Security Notes

- **NEVER commit your `.env` file** to git!
- The operator wallet needs to be authorized in the oracle contract
- The operator wallet needs ETH for gas (est. ~0.01 ETH per 30 proof fulfillments)
- Use a dedicated wallet for the operator (not your main wallet)

## Usage

### Start the Operator

```bash
npm start
```

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Expected Output

```
🚀 Initializing ZK Proof Oracle Operator...

📋 Configuration:
   Network: Chain ID 1
   Oracle: 0x312D098B64e32ef04736662249bd57AEfe053750
   Operator: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   Balance: 1000.0 ETH
   Is Authorized: true
   Proof API: https://api.ethvault.qkey.co/api/prove

👂 Listening for ProofRequested events...

Press Ctrl+C to stop

────────────────────────────────────────────────────────────────────────────────

📨 New Proof Request
   Request ID: 0xaeb1c59ded4e531fbfb7bffbe72625ecdd7c3dc756177efd049c3e36b224dea2
   Requester: 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496
   Message Hash: 0x1e93e67130910b2ee40c205492c80d2fb643094bc5b1675757923608d0f13b38
   Public Key Hash: 0x...
   📥 Fetching request details...
   Message: 0x546573742... (25 bytes)
   Signature: 0x0001020... (3309 bytes)
   Public Key: 0x000102... (1952 bytes)
   🔐 Generating ZK proof...
   ✅ Proof generated in 1234ms
   📤 Submitting proof to oracle...
   ⏳ Transaction sent: 0x...
   ✅ Proof fulfilled! Gas used: 285432
   🎉 Request 0xaeb1c59ded4e531fbfb7bffbe72625ecdd7c3dc756177efd049c3e36b224dea2 completed successfully!
```

## How It Works

### Event Listening

The operator subscribes to `ProofRequested` events from the ZKProofOracle:

```javascript
oracle.on('ProofRequested', async (requestId, requester, messageHash, publicKeyHash) => {
  await handleProofRequest(requestId, requester, messageHash, publicKeyHash);
});
```

### Request Handling

For each event:

1. **Check if already fulfilled** - Skip if proof already exists
2. **Fetch full request** - Get message, signature, publicKey from oracle
3. **Call proof API** - Send data to Vercel API for proof generation
4. **Submit proof** - Call `oracle.fulfillProof()` with the generated proof
5. **Wait for confirmation** - Confirm transaction was mined

### Past Events

On startup, the operator checks for recent unfulfilled requests (last 100 blocks) and processes them:

```javascript
const pastEvents = await oracle.queryFilter(filter, currentBlock - 100, currentBlock);
for (const event of pastEvents) {
  if (!isFulfilled) {
    await handleProofRequest(...);
  }
}
```

## Gas Costs

Each proof fulfillment costs approximately:

| Operation | Gas | Cost @ 20 gwei |
|-----------|-----|----------------|
| `fulfillProof()` | ~300,000 | ~$1.26 |
| Groth16 verification | ~250,000 | ~$1.05 |
| Storage | ~50,000 | ~$0.21 |

**Monthly estimate:** ~$37.80 for 30 proofs/month @ 20 gwei

## Error Handling

The operator handles common errors gracefully:

- **Invalid signature** - API returns error, operator logs and skips
- **Transaction failure** - Operator logs error and continues
- **Network issues** - Reconnects automatically (ethers.js)
- **API timeout** - Logs error, request can be retried later

## Monitoring

### Logs

All operations are logged with clear emojis:

- 📨 New request detected
- 📥 Fetching request details
- 🔐 Generating proof
- ✅ Success
- ❌ Error
- ⏭️  Skipped (already fulfilled)

### Metrics (Future Enhancement)

Consider adding:
- Request fulfillment rate
- Average proof generation time
- Gas costs per day/week/month
- Failed requests count

## Multi-Operator Setup

For production, run multiple operators for redundancy:

1. **Primary operator** - Main fulfillment service
2. **Backup operator** - Takes over if primary fails
3. **Monitoring** - Alert if no operators are running

Each operator automatically skips already-fulfilled requests, so they can run concurrently without conflicts.

## Troubleshooting

### Operator Not Authorized

**Error:** `Operator 0x... is not authorized in oracle`

**Solution:** Add operator to oracle:
```bash
cast send $ZK_ORACLE_ADDRESS \
  "addOperator(address)" \
  $OPERATOR_ADDRESS \
  --rpc-url $TENDERLY_RPC_URL \
  --private-key $OWNER_PRIVATE_KEY
```

### Insufficient Balance

**Error:** `Warning: Operator has zero balance`

**Solution:** Send ETH to operator wallet:
```bash
cast send $OPERATOR_ADDRESS \
  --value 1ether \
  --rpc-url $TENDERLY_RPC_URL \
  --private-key $FUNDED_WALLET_PRIVATE_KEY
```

### API Connection Failed

**Error:** `API error: 500` or timeout

**Solution:**
- Check `PROOF_API_URL` is correct
- Verify API is running (`curl $PROOF_API_URL`)
- Check network connectivity
- Review API logs for errors

### Transaction Reverts

**Error:** `Transaction reverted`

**Possible causes:**
- Request already fulfilled
- Request expired (> 1 hour old)
- Invalid proof data
- Insufficient gas limit

**Solution:** Check oracle state:
```bash
cast call $ZK_ORACLE_ADDRESS \
  "isRequestFulfilled(bytes32)" \
  $REQUEST_ID \
  --rpc-url $TENDERLY_RPC_URL
```

## Production Deployment

### Using PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start index.js --name zk-operator
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
```

```bash
docker build -t zk-operator .
docker run -d --env-file .env zk-operator
```

### Using systemd (Linux)

Create `/etc/systemd/system/zk-operator.service`:

```ini
[Unit]
Description=ZK Proof Oracle Operator
After=network.target

[Service]
Type=simple
User=operator
WorkingDirectory=/opt/zk-operator
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable zk-operator
sudo systemctl start zk-operator
sudo systemctl status zk-operator
```

## Security Best Practices

1. **Dedicated Wallet** - Use a wallet only for operator duties
2. **Limited Funds** - Only keep enough ETH for ~1 week of operations
3. **Rate Limiting** - Consider adding rate limits to prevent spam
4. **Monitoring** - Alert on unusual activity (too many requests, high gas)
5. **Secure Storage** - Use encrypted environment variables in production
6. **Regular Updates** - Keep dependencies up to date

## Development

### Testing Locally

1. Start local proof API:
```bash
cd ../api/zk-proof
npm run dev
```

2. Update `.env` to use local API:
```bash
PROOF_API_URL=http://localhost:3000/api/prove
```

3. Run operator:
```bash
npm run dev
```

### Simulating Requests

Use Foundry to create test requests:

```bash
cast send $ZK_ORACLE_ADDRESS \
  "requestProof(bytes,bytes,bytes)" \
  $MESSAGE $SIGNATURE $PUBLIC_KEY \
  --value 0.001ether \
  --rpc-url $TENDERLY_RPC_URL \
  --private-key $TEST_WALLET_PRIVATE_KEY
```

## License

MIT

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourusername/EthVaultPQ/issues
- Documentation: See `TENDERLY_DEPLOYMENT.md`
