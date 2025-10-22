# Tenderly Deployment Summary - October 21, 2025

## 🎉 Deployment Complete!

Both ZK-SNARK contracts are now deployed and running on Tenderly Ethereum Virtual TestNet.

---

## Deployed Contracts

### 1. Groth16VerifierReal
**Address:** `0x1b7754689d5bDf4618aA52dDD319D809a00B0843`

**Purpose:** Verifies ZK-SNARK proofs on-chain using Groth16 algorithm

**Gas Used:** 473,670 gas (~0.00000004737 ETH @ 0.000100002 gwei)

**Function:**
```solidity
function verifyProof(
    uint[2] calldata _pA,
    uint[2][2] calldata _pB,
    uint[2] calldata _pC,
    uint[2] calldata _pubSignals
) public view returns (bool)
```

**Status:** ✅ Deployed and ready

---

### 2. ZKProofOracle
**Address:** `0x312D098B64e32ef04736662249bd57AEfe053750`

**Purpose:** Oracle for requesting/fulfilling ZK proofs of Dilithium signatures

**Gas Used:** 2,793,833 gas (~0.00000027939 ETH @ 0.000100002 gwei)

**Configuration:**
- Proof Fee: 0.001 ETH (1,000,000,000,000,000 wei)
- Deployer as Operator: ✅ Yes
- Verifier: `0x1b7754689d5bDf4618aA52dDD319D809a00B0843`
- Request Expiration: 1 hour (default)

**Key Functions:**
```solidity
// Request a proof
function requestProof(
    bytes memory message,
    bytes memory signature,
    bytes memory publicKey
) external payable returns (bytes32 requestId)

// Fulfill a proof (operator only)
function fulfillProof(
    bytes32 requestId,
    uint256[2] calldata _pA,
    uint256[2][2] calldata _pB,
    uint256[2] calldata _pC,
    uint256[3] calldata _pubSignals
) external
```

**Status:** ✅ Deployed and configured

---

## Network Information

**Network:** Tenderly Ethereum Virtual TestNet
**Chain ID:** 1 (Ethereum mainnet fork)
**RPC URL:** https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d
**Deployer:** 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

---

## Environment Variables

Add these to your `.env` file:

```bash
# ZK Oracle Contracts (Tenderly)
GROTH16_VERIFIER_ADDRESS=0x1b7754689d5bDf4618aA52dDD319D809a00B0843
ZK_ORACLE_ADDRESS=0x312D098B64e32ef04736662249bd57AEfe053750

# Tenderly Network
RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d
CHAIN_ID=1
```

Add these to `api/zk-proof/.env`:

```bash
# Oracle Configuration
ZK_ORACLE_ADDRESS=0x312D098B64e32ef04736662249bd57AEfe053750
TENDERLY_RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d
OPERATOR_PRIVATE_KEY=your_operator_private_key_here
```

---

## Testing the Deployment

### 1. Verify Contracts Exist

```bash
# Check Groth16Verifier
cast code 0x1b7754689d5bDf4618aA52dDD319D809a00B0843 --rpc-url tenderly

# Check ZKProofOracle
cast code 0x312D098B64e32ef04736662249bd57AEfe053750 --rpc-url tenderly
```

### 2. Check Oracle Configuration

```bash
# Get proof fee
cast call 0x312D098B64e32ef04736662249bd57AEfe053750 \
  "proofFee()(uint256)" \
  --rpc-url tenderly

# Check if deployer is operator
cast call 0x312D098B64e32ef04736662249bd57AEfe053750 \
  "operators(address)(bool)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url tenderly
```

### 3. Test End-to-End Workflow

See `INTEGRATION_TEST.md` for complete end-to-end testing instructions.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ OFF-CHAIN (Vercel API)                                       │
│ https://api.ethvault.qkey.co/api/prove                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Verify Dilithium signature with @noble/post-quantum      │
│ 2. Generate ZK-SNARK proof with snarkjs                     │
│ 3. Return Groth16 proof                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ TENDERLY (Ethereum Fork)                                     │
├─────────────────────────────────────────────────────────────┤
│ User → ZKProofOracle.requestProof()                         │
│          ↓ (emits ProofRequested event)                     │
│ Operator listens for event                                  │
│          ↓                                                   │
│ Operator calls /api/prove                                   │
│          ↓                                                   │
│ Operator → ZKProofOracle.fulfillProof()                     │
│          ↓                                                   │
│ Groth16VerifierReal.verifyProof() ✅                        │
│          ↓                                                   │
│ User receives callback with verified proof                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Gas Costs Analysis

### Deployment Costs
| Contract | Gas Used | Cost @ 0.0001 gwei | Cost @ 20 gwei |
|----------|----------|-------------------|----------------|
| Groth16VerifierReal | 473,670 | ~$0.0000001 | ~$0.20 |
| ZKProofOracle | 2,793,833 | ~$0.0000006 | ~$1.19 |
| **Total** | **3,267,503** | **~$0.0000007** | **~$1.39** |

### Runtime Costs (Estimated)
| Operation | Gas Estimate | Cost @ 20 gwei |
|-----------|--------------|----------------|
| Request Proof | ~50,000 | ~$0.21 |
| Groth16 Verify | ~250,000 | ~$1.05 |
| Fulfill Proof | ~300,000 | ~$1.26 |
| **Total per Signature** | **~600,000** | **~$2.52** |

**Note:** Tenderly testing is FREE! Real costs only apply on mainnet.

---

## Next Steps

### Immediate Testing
1. ✅ Contracts deployed
2. 🔄 Create integration test script
3. 🔄 Test proof request/fulfill workflow
4. 🔄 Verify gas costs match estimates
5. 🔄 Test with multiple operators

### Production Readiness
1. Set up monitoring for ProofRequested events
2. Deploy operator service (Node.js listener)
3. Add multiple operators for redundancy
4. Set up alerts for failed proofs
5. Professional security audit before mainnet

---

## Operator Setup

### Requirements
- Node.js 20+
- Private key with ETH for gas
- Access to Tenderly RPC
- Access to Vercel API

### Operator Service (Pseudocode)
```typescript
// operator/index.ts
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(TENDERLY_RPC_URL);
const wallet = new ethers.Wallet(OPERATOR_PRIVATE_KEY, provider);
const oracle = new ethers.Contract(ZK_ORACLE_ADDRESS, ABI, wallet);

// Listen for ProofRequested events
oracle.on('ProofRequested', async (requestId, requester, messageHash, publicKeyHash) => {
  console.log('Proof requested:', requestId);

  // Get request details
  const request = await oracle.getRequest(requestId);

  // Call Vercel API to generate proof
  const response = await fetch('https://api.ethvault.qkey.co/api/prove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: request.message,
      signature: request.signature,
      publicKey: request.publicKey
    })
  });

  const { proof, publicSignals } = await response.json();

  // Fulfill proof on-chain
  const tx = await oracle.fulfillProof(
    requestId,
    proof.a,
    proof.b,
    proof.c,
    publicSignals
  );

  await tx.wait();
  console.log('Proof fulfilled:', requestId);
});
```

---

## Troubleshooting

### Common Issues

**1. Transaction Reverts**
- Check deployer has enough ETH
- Verify proof fee is included (0.001 ETH)
- Ensure signature is valid Dilithium3

**2. Proof Verification Fails**
- Verify proof was generated with same circuit
- Check publicSignals match request
- Ensure Groth16VerifierReal address is correct

**3. Operator Not Authorized**
- Check operator address in oracle.operators mapping
- Add operator: `oracle.addOperator(operatorAddress)` (owner only)

---

## Contract Verification (Optional)

To verify contracts on Tenderly/Etherscan:

```bash
# Verify Groth16VerifierReal
forge verify-contract \
  0x1b7754689d5bDf4618aA52dDD319D809a00B0843 \
  contracts/verifiers/Groth16VerifierReal.sol:Groth16Verifier \
  --chain-id 1 \
  --rpc-url tenderly

# Verify ZKProofOracle
forge verify-contract \
  0x312D098B64e32ef04736662249bd57AEfe053750 \
  contracts/oracles/ZKProofOracle.sol:ZKProofOracle \
  --chain-id 1 \
  --rpc-url tenderly \
  --constructor-args $(cast abi-encode "constructor(address)" 0x1b7754689d5bDf4618aA52dDD319D809a00B0843)
```

---

## Deployment Artifacts

**Transaction Logs:**
- Groth16Verifier: `/broadcast/DeployGroth16Verifier.s.sol/1/run-latest.json`
- ZKProofOracle: `/broadcast/DeployZKOracle.s.sol/1/run-latest.json`

**Deployment Scripts:**
- `script/DeployGroth16Verifier.s.sol`
- `script/DeployZKOracle.s.sol`

---

## Security Considerations

### Deployed State
✅ Oracle has replay protection (usedRequestIds mapping)
✅ Deployer is authorized operator
✅ Groth16Verifier is immutable (no upgrades)
✅ Proof fee set to reasonable 0.001 ETH
✅ Request expiration set to 1 hour

### Before Mainnet
- [ ] Professional security audit
- [ ] Multi-operator setup
- [ ] Emergency pause testing
- [ ] Gas optimization review
- [ ] Front-running analysis

---

## Success Metrics

### Deployment Success ✅
- [x] Groth16VerifierReal deployed
- [x] ZKProofOracle deployed
- [x] Oracle configured with correct verifier
- [x] Deployer authorized as operator
- [x] Proof fee set correctly

### Testing Success (Pending)
- [ ] Request proof transaction succeeds
- [ ] Proof generation completes < 5 seconds
- [ ] Fulfill proof transaction succeeds
- [ ] Groth16 verification passes
- [ ] Gas costs within estimates
- [ ] End-to-end workflow < 10 seconds

---

**Deployment Date:** October 21, 2025
**Network:** Tenderly Ethereum Virtual TestNet
**Status:** ✅ DEPLOYED AND READY FOR TESTING

**Next:** Create integration test to verify the complete workflow!
