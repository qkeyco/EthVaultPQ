# Free Oracle Usage for Your Own Apps

Your vesting app (and any other apps you own) can use the oracle services **for free**!

## How It Works

Both oracles now have a **whitelist** system where the owner can add addresses that bypass payment requirements:

```solidity
// Whitelist mapping
mapping(address => bool) public freeUsers;

// In requestProof():
if (!freeUsers[msg.sender]) {
    if (msg.value < proofFee) revert InsufficientPayment();
    totalRevenue += proofFee;
}
// Free users skip payment check entirely!
```

---

## Setup Instructions

### Step 1: Deploy Your Vesting App

```bash
# Deploy your vesting contract to Tenderly
forge create contracts/YourVestingApp.sol:YourVestingApp \
    --constructor-args <ZK_ORACLE_ADDR> <QRNG_ORACLE_ADDR> \
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $PRIVATE_KEY

# Note the deployed address
VESTING_APP=0x...
```

### Step 2: Whitelist Your App

```bash
# Whitelist vesting app for free ZK proofs
cast send <ZK_ORACLE_ADDR> \
    "addFreeUser(address)" \
    $VESTING_APP \
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $PRIVATE_KEY

# Whitelist for free QRNG too
cast send <QRNG_ORACLE_ADDR> \
    "addFreeUser(address)" \
    $VESTING_APP \
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $PRIVATE_KEY
```

### Step 3: Use Oracle for Free!

```solidity
// In your vesting app contract
contract VestingApp {
    ZKProofOracle public zkOracle;

    function claimVesting(bytes memory sig, bytes memory pk) external {
        // No payment needed - just call it!
        bytes32 requestId = zkOracle.requestProof(
            abi.encode(msg.sender, amount),
            sig,
            pk
        );
        // Oracle will fulfill for free
    }
}
```

---

## Verifying Free Status

Check if an address is whitelisted:

```bash
# Check ZK Oracle
cast call <ZK_ORACLE_ADDR> \
    "freeUsers(address)(bool)" \
    $VESTING_APP \
    --rpc-url $TENDERLY_RPC_URL

# Returns: true (whitelisted) or false (pays fees)
```

---

## Managing Whitelist

### Add More Addresses

```bash
# Whitelist another contract
cast send <ZK_ORACLE_ADDR> \
    "addFreeUser(address)" \
    <NEW_CONTRACT_ADDR> \
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $PRIVATE_KEY
```

### Remove from Whitelist

```bash
# Remove free access (if you want to start charging)
cast send <ZK_ORACLE_ADDR> \
    "removeFreeUser(address)" \
    $VESTING_APP \
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $PRIVATE_KEY
```

---

## Revenue Tracking

The oracle still tracks revenue properly:

- **Free users:** Requests processed, NO revenue added
- **Paying users:** Revenue accumulated in `totalRevenue`

```bash
# Check total revenue collected
cast call <ZK_ORACLE_ADDR> "totalRevenue()" --rpc-url $TENDERLY_RPC_URL

# Withdraw revenue (only from paying users)
cast send <ZK_ORACLE_ADDR> \
    "withdrawRevenue(uint256)" \
    1000000000000000000 \
    --rpc-url $TENDERLY_RPC_URL \
    --private-key $PRIVATE_KEY
```

---

## Use Cases for Whitelisting

### Your Own Apps (Free Forever)
- Vesting contracts
- DAO governance contracts
- Internal testing contracts
- Partner integrations (initially)

### Partners (Temporary Free Access)
```solidity
// Add partner for 30-day trial
addFreeUser(partnerAddress);

// After trial, remove them
removeFreeUser(partnerAddress);

// They can then subscribe or pay-per-use
```

### High-Value Customers (Discounts)
```solidity
// Instead of free, you could also:
// - Manually top up their subscription
subscriptions[enterpriseCustomer] += 100 ether;
```

---

## Example: Vesting App Integration

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./oracles/ZKProofOracle.sol";

contract TokenVesting is IProofConsumer {
    ZKProofOracle public zkOracle;

    mapping(address => VestingSchedule) public vesting;
    mapping(bytes32 => ClaimRequest) public claims;

    struct VestingSchedule {
        uint256 totalAmount;
        uint256 claimed;
        uint256 startTime;
        bytes32 dilithiumPublicKeyHash;
    }

    struct ClaimRequest {
        address beneficiary;
        uint256 amount;
        bool processed;
    }

    constructor(address _zkOracle) {
        zkOracle = ZKProofOracle(_zkOracle);
        // No subscription needed - we're whitelisted!
    }

    function claimVested(
        uint256 amount,
        bytes memory dilithiumSignature,
        bytes memory dilithiumPublicKey
    ) external returns (bytes32 requestId) {
        VestingSchedule storage schedule = vesting[msg.sender];
        require(schedule.totalAmount > 0, "No vesting");
        require(amount <= getVestedAmount(msg.sender) - schedule.claimed, "Amount too high");

        // Request ZK proof - NO PAYMENT NEEDED (we're whitelisted)
        requestId = zkOracle.requestProof(
            abi.encode(msg.sender, amount),
            dilithiumSignature,
            dilithiumPublicKey
        );

        claims[requestId] = ClaimRequest({
            beneficiary: msg.sender,
            amount: amount,
            processed: false
        });

        return requestId;
    }

    function handleProof(
        bytes32 requestId,
        bytes memory proof,
        uint256[3] memory publicSignals
    ) external override {
        require(msg.sender == address(zkOracle), "Only oracle");

        ClaimRequest storage claim = claims[requestId];
        require(!claim.processed, "Already processed");
        require(publicSignals[2] == 1, "Invalid signature");

        claim.processed = true;

        VestingSchedule storage schedule = vesting[claim.beneficiary];
        schedule.claimed += claim.amount;

        // Transfer tokens
        payable(claim.beneficiary).transfer(claim.amount);
    }

    function getVestedAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = vesting[beneficiary];
        if (block.timestamp < schedule.startTime) return 0;

        uint256 elapsed = block.timestamp - schedule.startTime;
        uint256 vestingPeriod = 365 days;

        if (elapsed >= vestingPeriod) {
            return schedule.totalAmount;
        }

        return (schedule.totalAmount * elapsed) / vestingPeriod;
    }
}
```

---

## Summary

✅ **Your vesting app can use oracles completely free**
✅ **Just whitelist the contract address after deployment**
✅ **Other users still pay fees normally**
✅ **You control the whitelist as contract owner**
✅ **Revenue tracking remains accurate**

This gives you the flexibility to:
- Use your own infrastructure for free
- Offer free trials to partners
- Generate revenue from external users
- Provide tiered pricing (free, subscription, pay-per-use)

Perfect for a SaaS model! 🚀
