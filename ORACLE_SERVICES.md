# EthVaultPQ Oracle Services

On-chain paid services for ZK proof generation and quantum random number generation, similar to Chainlink VRF.

## 🎯 Services Overview

### 1. ZK Proof Oracle
**Purpose:** Off-chain generation of ZK-SNARK proofs for Dilithium signatures
**Price:** 0.001 ETH per proof (~$2.50 USD)
**Latency:** ~1.5 seconds (off-chain proof generation)
**Gas Cost:** ~250-300k gas for on-chain verification

### 2. Quantum RNG Oracle
**Purpose:** True quantum random numbers from ANU Quantum Random Number Server
**Price:** 0.0005 ETH per random number (~$1.25 USD)
**Latency:** ~1-2 seconds (quantum measurement + submission)
**Gas Cost:** ~100k gas for fulfillment
**Source:** Australian National University quantum vacuum fluctuations

---

## 📁 Architecture

```
┌─────────────────┐
│  Consumer dApp  │
└────────┬────────┘
         │ 1. Request + Payment
         ▼
┌────────────────────┐
│  Oracle Contract   │ (On-chain)
│  - ZKProofOracle   │
│  - QRNGOracle      │
└────────┬───────────┘
         │ 2. Emit Event
         ▼
┌────────────────────┐
│  Oracle Service    │ (Off-chain)
│  - Event Listener  │
│  - Proof Generator │
│  - QRNG Fetcher    │
└────────┬───────────┘
         │ 3. Generate/Fetch
         ▼
┌────────────────────┐
│  External APIs     │
│  - Vercel ZK API   │
│  - ANU QRNG API    │
└────────┬───────────┘
         │ 4. Result
         ▼
┌────────────────────┐
│  Oracle Contract   │
│  fulfillProof()    │
│  fulfillRandom()   │
└────────┬───────────┘
         │ 5. Callback
         ▼
┌─────────────────┐
│  Consumer dApp  │
└─────────────────┘
```

---

## 🚀 Deployment

### Step 1: Deploy Contracts

```bash
# Set environment variables
export PRIVATE_KEY=0x...
export TENDERLY_RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/YOUR_TENDERLY_ID

# Deploy all oracle contracts to Tenderly Virtual TestNet
forge script script/DeployOracles.s.sol:DeployOracles \
    --rpc-url $TENDERLY_RPC_URL \
    --broadcast \
    --slow

# Output:
# Groth16Verifier: 0x...
# ZKProofOracle: 0x...
# QRNGOracle: 0x...
```

### Step 2: Run Oracle Service

```bash
cd oracle-service

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Add:
# - ORACLE_PRIVATE_KEY (operator wallet)
# - ZK_ORACLE_ADDRESS (from deployment)
# - QRNG_ORACLE_ADDRESS (from deployment)
# - TENDERLY_RPC_URL (from your Tenderly dashboard)

# Start service
npm start

# Output:
# 🚀 Starting EthVaultPQ Oracle Service...
# ✅ Wallet initialized: 0x...
# 📡 Starting event listeners...
# ✅ Oracle service running
```

### Step 3: Test It

```bash
# Deploy example consumer
forge create contracts/examples/OracleConsumerExample.sol:OracleConsumerExample \
    --constructor-args <ZK_ORACLE_ADDR> <QRNG_ORACLE_ADDR> \
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $PRIVATE_KEY

# Request a ZK proof
cast send <CONSUMER_ADDR> \
    "requestProofVerification(bytes,bytes,bytes)" \
    <MESSAGE_HEX> <SIG_HEX> <PK_HEX> \
    --value 0.001ether \
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $PRIVATE_KEY

# Request quantum random
cast send <CONSUMER_ADDR> \
    "requestRandomNumber(bytes32)" \
    0x0000000000000000000000000000000000000000000000000000000000000000 \
    --value 0.0005ether \
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $PRIVATE_KEY
```

---

## 💰 Pricing Models

### Pay-Per-Use
- ZK Proof: 0.001 ETH per request
- QRNG: 0.0005 ETH per request
- Best for: Occasional usage, testing

### Subscription (Prepaid)
```solidity
// Deposit 0.05 ETH to oracle
oracle.subscribe{value: 0.05 ether}();

// Use subscription balance
oracle.requestProofWithSubscription(msg, sig, pk);
```

Pricing tiers:
- **Starter:** 0.05 ETH = 50 ZK proofs or 100 random numbers
- **Pro:** 0.2 ETH = 200 proofs (20% discount)
- **Enterprise:** Custom pricing for high volume

### Revenue Distribution
- **Oracle Operator:** 70% (covers API costs, infrastructure, profit)
- **Protocol Treasury:** 30% (development, security audits)

---

## 🔧 Integration Guide

### For dApp Developers

1. **Implement Consumer Interface**

```solidity
import "./oracles/ZKProofOracle.sol";

contract MyDApp is IProofConsumer {
    ZKProofOracle public oracle;

    constructor(address _oracle) {
        oracle = ZKProofOracle(_oracle);
    }

    function verifySignature(bytes memory sig, bytes memory pk) external payable {
        bytes32 reqId = oracle.requestProof{value: 0.001 ether}(
            abi.encode(msg.sender),
            sig,
            pk
        );
        // Store reqId for later
    }

    function handleProof(
        bytes32 requestId,
        bytes memory proof,
        uint256[3] memory publicSignals
    ) external override {
        require(msg.sender == address(oracle));

        bool isValid = publicSignals[2] == 1;
        if (isValid) {
            // Signature verified! Proceed with action
        }
    }
}
```

2. **Request Services**

```solidity
// ZK Proof
bytes32 requestId = oracle.requestProof{value: 0.001 ether}(msg, sig, pk);

// Quantum Random
bytes32 reqId = qrng.requestRandomness{value: 0.0005 ether}(seed);

// Multiple randoms (batch discount)
bytes32[] memory reqIds = qrng.requestMultipleRandomness{value: 0.005 ether}(10, seed);
```

3. **Receive Callbacks**

```solidity
function handleProof(bytes32 reqId, bytes memory proof, uint256[3] memory signals) external {
    // Your logic here
}

function handleRandomness(bytes32 reqId, uint256 randomness) external {
    // Use randomness
    uint256 diceRoll = (randomness % 6) + 1;
}
```

---

## 🔐 Security Considerations

### For Oracle Operators

1. **Private Key Security**
   - Use hardware wallet or AWS KMS
   - Never commit keys to git
   - Rotate keys regularly

2. **Monitoring**
   - Track request fulfillment rate
   - Monitor gas prices (set max gas price)
   - Alert on failed transactions

3. **Rate Limiting**
   - Implement request limits per address
   - Detect and prevent spam
   - Blacklist malicious requesters

### For Consumers

1. **Validate Callbacks**
   ```solidity
   require(msg.sender == address(oracle), "Only oracle");
   require(knownRequests[requestId], "Unknown request");
   ```

2. **Handle Failures**
   ```solidity
   // Check request status before using result
   require(oracle.isRequestFulfilled(requestId), "Not fulfilled");
   ```

3. **Set Timeouts**
   ```solidity
   require(block.timestamp < request.deadline, "Request expired");
   ```

---

## 📊 Economics & Sustainability

### Cost Breakdown (per ZK Proof)

| Component | Cost | Notes |
|-----------|------|-------|
| Vercel API | ~$0.05 | Serverless function execution |
| On-chain gas | ~$0.50 | 250k gas @ 2 gwei |
| Operator profit | ~$1.45 | Incentive for running oracle |
| Protocol fee | ~$0.50 | Treasury for development |
| **Consumer pays** | **$2.50** | **0.001 ETH** |

### Competitive Analysis

| Service | Type | Price | Latency |
|---------|------|-------|---------|
| **EthVaultPQ ZK** | ZK Proof | $2.50 | 1.5s |
| Chainlink VRF | Random | $5-10 | 1 block |
| API3 QRNG | Random | $2 | 2 blocks |
| **EthVaultPQ QRNG** | Quantum Random | $1.25 | 1-2s |

### Revenue Projections

Assuming 1,000 requests/day:
- **Daily:** 1 ETH ($2,500)
- **Monthly:** 30 ETH ($75,000)
- **Annual:** 365 ETH ($912,500)

At scale (10,000 requests/day):
- **Annual:** 3,650 ETH ($9.1M)

---

## 🧪 Testing

```bash
# Run oracle contract tests
forge test --match-contract ZKProofOracleTest -vv

# Test QRNG oracle
forge test --match-contract QRNGOracleTest -vv

# Integration test (requires running oracle service)
forge test --match-contract OracleIntegrationTest --fork-url $TENDERLY_RPC_URL
```

---

## 🛠 Maintenance

### Updating Fees

```bash
# Update ZK proof fee
cast send <ZK_ORACLE_ADDR> \
    "setProofFee(uint256)" \
    1500000000000000 \  # 0.0015 ETH
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $OWNER_KEY

# Update QRNG fee
cast send <QRNG_ORACLE_ADDR> \
    "setRandomnessFee(uint256)" \
    750000000000000 \  # 0.00075 ETH
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $OWNER_KEY
```

### Adding Operators

```bash
cast send <ORACLE_ADDR> \
    "addOperator(address)" \
    <NEW_OPERATOR_ADDR> \
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $OWNER_KEY
```

### Withdrawing Revenue

```bash
# Check revenue
cast call <ORACLE_ADDR> "totalRevenue()" --rpc-url $TENDERLY_RPC_URL

# Withdraw
cast send <ORACLE_ADDR> \
    "withdrawRevenue(uint256)" \
    1000000000000000000 \  # 1 ETH
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $OWNER_KEY
```

---

## 📚 API Reference

See:
- [ZKProofOracle.sol](contracts/oracles/ZKProofOracle.sol) - Full contract code
- [QRNGOracle.sol](contracts/oracles/QRNGOracle.sol) - Full contract code
- [OracleConsumerExample.sol](contracts/examples/OracleConsumerExample.sol) - Integration examples

---

## 🤝 Contributing

Want to run an oracle node? [Contact us](mailto:oracle@ethvaultpq.com)

---

## 📄 License

MIT License - See [LICENSE](LICENSE)
