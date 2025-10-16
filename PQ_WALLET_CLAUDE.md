# Claude Development Patterns & Guidelines - PQ Wallet Vault

## ✅ Core Development Philosophy

### Web-Based React UI with MetaMask Signing

**ALWAYS DO THIS**: Use React components that connect to MetaMask and sign transactions in the browser

**Example Pattern**:
```tsx
// ✅ CORRECT PATTERN
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';

const { address, isConnected } = useAccount();
const { data: walletClient } = useWalletClient();
const publicClient = usePublicClient();

// Sign transactions via MetaMask (NEVER store private keys)
const hash = await walletClient.writeContract({
  address: pqWalletFactoryAddress,
  abi: pqWalletFactoryAbi,
  functionName: 'createWallet',
  args: [pqPublicKey, salt],
  account: address,
});
```

**Why This Approach?**:
- ✅ Zero private key storage
- ✅ User controls all signing via MetaMask
- ✅ Superior security posture
- ✅ Professional UX (web interface)
- ✅ Industry-standard pattern

---

## ❌ ANTI-PATTERNS - Never Do These

### 1. Private Keys in Files
```bash
# ❌ NEVER DO THIS
DEPLOYER_PRIVATE_KEY="0x..."
WALLET_SEED_PHRASE="word1 word2..."
```

### 2. Hardcoded Secrets
```typescript
// ❌ NEVER DO THIS
const ADMIN_KEY = "0x1234...";
const SECRET_SALT = "my-secret-salt";
```

### 3. Creating _FIXED Files as Main Version
```bash
# ❌ WRONG
mv PQWallet.sol PQWallet_OLD.sol
# create PQWallet_FIXED.sol as new main file

# ✅ CORRECT
mv PQWallet.sol PQWallet_BEFOREFIX.sol
# overwrite PQWallet.sol with fixes
```

---

## File Naming and Version Control

### CRITICAL: File Modification Pattern

When fixing bugs or updating contracts:

1. **Backup original** with `_BEFOREFIX` suffix
2. **Overwrite original** filename with your fixes
3. **Never use** `_FIXED` as the primary filename

**Example**:
```bash
# Before fix:
contracts/PQWallet.sol              # Current version

# After fix:
contracts/PQWallet.sol              # ✅ Fixed version (SAME NAME)
contracts/PQWallet_BEFOREFIX.sol    # ✅ Backup of original
```

**Why?**:
- ✅ Imports don't break (`import "./PQWallet.sol"` still works)
- ✅ Build scripts reference correct file
- ✅ Deployment scripts don't need updates
- ✅ Documentation stays accurate
- ✅ Team knows which file is "current"

**When to Create New Files**:
- New major version: `PQWalletV2.sol`
- New feature: `PaymentStreaming.sol`
- Test files: `PQWallet.t.sol`
- Helper contracts: `PQWalletHelpers.sol`

---

## Architecture Stack

```
React Dashboard (TypeScript)
  ↓
wagmi + viem (Web3 React hooks)
  ↓
MetaMask (User's wallet signs UserOperations)
  ↓
Bundler (submits UserOps to EntryPoint)
  ↓
EntryPoint (ERC-4337 singleton)
  ↓
PQWallet (your smart contract wallet)
  ↓
PQValidator (verifies post-quantum signatures)
```

---

## ERC-4337 Specific Patterns

### UserOperation Creation
```typescript
// Create UserOperation for PQ wallet
const userOp = {
  sender: pqWalletAddress,
  nonce: await getPqWalletNonce(),
  initCode: '0x', // Empty if wallet already deployed
  callData: encodeFunctionData({
    abi: pqWalletAbi,
    functionName: 'execute',
    args: [targetAddress, value, callData],
  }),
  callGasLimit: 100000n,
  verificationGasLimit: 200000n,
  preVerificationGas: 50000n,
  maxFeePerGas: await getMaxFeePerGas(),
  maxPriorityFeePerGas: await getMaxPriorityFeePerGas(),
  paymasterAndData: '0x', // Or paymaster address + data
  signature: '0x', // Will be filled with PQ signature
};

// Sign with post-quantum algorithm OFF-CHAIN
const pqSignature = await signUserOpWithPQ(userOp, privateKey);
userOp.signature = pqSignature;

// Submit to bundler
const userOpHash = await bundler.sendUserOperation(userOp);
```

### Wallet Factory Pattern
```typescript
// Deploy new PQ wallet via factory
const createWallet = async (pqPublicKey: string) => {
  // 1. Calculate counterfactual address
  const salt = generateRandomSalt();
  const predictedAddress = await publicClient.readContract({
    address: pqWalletFactoryAddress,
    abi: pqWalletFactoryAbi,
    functionName: 'getAddress',
    args: [pqPublicKey, salt],
  });

  // 2. Create wallet (user signs via MetaMask)
  const hash = await walletClient.writeContract({
    address: pqWalletFactoryAddress,
    abi: pqWalletFactoryAbi,
    functionName: 'createWallet',
    args: [pqPublicKey, salt],
  });

  // 3. Wait for deployment
  await publicClient.waitForTransactionReceipt({ hash });

  return predictedAddress;
};
```

---

## ERC-4626 Vault Patterns

### Deposit with Vesting
```typescript
// User deposits into vault with vesting schedule
const depositWithVesting = async (
  amount: bigint,
  vestingDuration: number,
  vestingCliff: number
) => {
  // 1. Approve vault to spend tokens
  const approvalHash = await walletClient.writeContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [vaultAddress, amount],
  });
  await publicClient.waitForTransactionReceipt({ hash: approvalHash });

  // 2. Deposit with vesting parameters
  const depositHash = await walletClient.writeContract({
    address: vaultAddress,
    abi: vault4626Abi,
    functionName: 'depositWithVesting',
    args: [amount, address, vestingDuration, vestingCliff],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: depositHash });

  // 3. Extract shares minted from logs
  const depositEvent = receipt.logs.find(
    log => log.topics[0] === keccak256('Deposit(address,address,uint256,uint256)')
  );

  return { shares: depositEvent.data, receipt };
};
```

### Calculate Withdrawable Amount
```typescript
// Check how much user can withdraw based on vesting
const getWithdrawableShares = async (userAddress: string) => {
  const [
    totalShares,
    vestedShares,
    cliffTimestamp,
    vestingEndTimestamp
  ] = await publicClient.readContract({
    address: vaultAddress,
    abi: vault4626Abi,
    functionName: 'getVestingInfo',
    args: [userAddress],
  });

  const now = Math.floor(Date.now() / 1000);

  if (now < cliffTimestamp) {
    return 0n; // Still in cliff period
  }

  if (now >= vestingEndTimestamp) {
    return totalShares; // Fully vested
  }

  // Partially vested (linear)
  const vestingDuration = vestingEndTimestamp - cliffTimestamp;
  const timeVested = now - cliffTimestamp;
  const vestedAmount = (totalShares * BigInt(timeVested)) / BigInt(vestingDuration);

  return vestedAmount;
};
```

---

## Post-Quantum Signature Handling

### Off-Chain Signing (Client-Side)
```typescript
// Use SPHINCS+ or Dilithium library (example with conceptual API)
import { sphincsPlus } from '@pq-crypto/sphincs-plus';

const signMessageWithPQ = async (message: Uint8Array, privateKey: Uint8Array) => {
  // Sign with post-quantum algorithm
  const signature = await sphincsPlus.sign(message, privateKey);
  return signature;
};

const generatePQKeyPair = async () => {
  const keyPair = await sphincsPlus.generateKeyPair();
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey, // Store securely (e.g., browser extension)
  };
};
```

### On-Chain Verification (Solidity)
```solidity
// contracts/core/PQValidator.sol
contract PQValidator {
    /// @notice Verify SPHINCS+ signature
    /// @dev This is a simplified example - actual implementation requires
    ///      optimized crypto library or precompile for gas efficiency
    function verifySPHINCSPlus(
        bytes memory message,
        bytes memory signature,
        bytes memory publicKey
    ) public pure returns (bool) {
        // In production: use optimized library or ZK proof
        // For now: placeholder that calls precompile or library
        return SPHINCSPlusLib.verify(message, signature, publicKey);
    }

    /// @notice Validate signature for ERC-4337 wallet
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) external view returns (uint256 validationData) {
        bytes memory signature = userOp.signature;
        bytes memory publicKey = IWallet(userOp.sender).getPQPublicKey();

        bool isValid = verifySPHINCSPlus(
            abi.encodePacked(userOpHash),
            signature,
            publicKey
        );

        if (!isValid) {
            return SIG_VALIDATION_FAILED; // ERC-4337 standard
        }

        return 0; // Success
    }
}
```

---

## Dashboard Component Structure

### Wallet Creator Component
```tsx
// dashboard/src/components/WalletCreator.tsx
export const WalletCreator = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [pqKeyPair, setPqKeyPair] = useState<KeyPair | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const generateKeys = async () => {
    const keyPair = await generatePQKeyPair();
    setPqKeyPair(keyPair);
    // Show user: "Save your PQ private key securely!"
  };

  const createWallet = async () => {
    if (!pqKeyPair || !walletClient) return;

    setIsCreating(true);
    try {
      const salt = generateRandomSalt();

      // Deploy wallet via factory
      const hash = await walletClient.writeContract({
        address: PQ_WALLET_FACTORY_ADDRESS,
        abi: pqWalletFactoryAbi,
        functionName: 'createWallet',
        args: [pqKeyPair.publicKey, salt],
      });

      // Wait for deployment
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Get deployed address from event logs
      const walletCreatedEvent = receipt.logs.find(/*...*/);
      const deployedAddress = walletCreatedEvent.args.wallet;

      setWalletAddress(deployedAddress);

      // Save to localStorage
      localStorage.setItem('pqWalletAddress', deployedAddress);

    } catch (error) {
      console.error('Failed to create wallet:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <h2>Create Post-Quantum Wallet</h2>

      {!pqKeyPair && (
        <button onClick={generateKeys}>
          Generate PQ Key Pair
        </button>
      )}

      {pqKeyPair && !walletAddress && (
        <button onClick={createWallet} disabled={isCreating}>
          {isCreating ? 'Creating Wallet...' : 'Create Wallet'}
        </button>
      )}

      {walletAddress && (
        <div>
          ✅ Wallet Created: {walletAddress}
        </div>
      )}
    </div>
  );
};
```

### Vault Manager Component
```tsx
// dashboard/src/components/VaultManager.tsx
export const VaultManager = () => {
  const { address } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [vestingDuration, setVestingDuration] = useState(365); // days
  const [vestingCliff, setVestingCliff] = useState(30); // days

  const deposit = async () => {
    const amount = parseEther(depositAmount);

    // 1. Approve vault
    const approvalHash = await walletClient.writeContract({
      address: TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [VAULT_ADDRESS, amount],
    });
    await publicClient.waitForTransactionReceipt({ hash: approvalHash });

    // 2. Deposit with vesting
    const depositHash = await walletClient.writeContract({
      address: VAULT_ADDRESS,
      abi: vault4626Abi,
      functionName: 'depositWithVesting',
      args: [
        amount,
        address,
        vestingDuration * 24 * 60 * 60, // Convert days to seconds
        vestingCliff * 24 * 60 * 60,
      ],
    });

    await publicClient.waitForTransactionReceipt({ hash: depositHash });
  };

  return (
    <div>
      <h2>Deposit into Vault</h2>
      <input
        type="number"
        value={depositAmount}
        onChange={(e) => setDepositAmount(e.target.value)}
        placeholder="Amount"
      />
      <input
        type="number"
        value={vestingDuration}
        onChange={(e) => setVestingDuration(Number(e.target.value))}
        placeholder="Vesting Duration (days)"
      />
      <input
        type="number"
        value={vestingCliff}
        onChange={(e) => setVestingCliff(Number(e.target.value))}
        placeholder="Cliff Period (days)"
      />
      <button onClick={deposit}>Deposit</button>
    </div>
  );
};
```

---

## Testing Patterns

### Foundry Unit Tests
```solidity
// test/PQWallet.t.sol
contract PQWalletTest is Test {
    PQWalletFactory factory;
    PQWallet wallet;
    PQValidator validator;

    bytes pqPublicKey = hex"..."; // SPHINCS+ public key
    bytes pqPrivateKey = hex"..."; // For test signing

    function setUp() public {
        validator = new PQValidator();
        factory = new PQWalletFactory(address(validator));

        wallet = PQWallet(factory.createWallet(pqPublicKey, 0));
    }

    function test_CreateWallet() public {
        assertEq(wallet.getPQPublicKey(), pqPublicKey);
        assertEq(wallet.validator(), address(validator));
    }

    function test_ValidateUserOp() public {
        // Create UserOperation
        UserOperation memory userOp = UserOperation({
            sender: address(wallet),
            nonce: 0,
            initCode: "",
            callData: abi.encodeCall(wallet.execute, (address(0), 0, "")),
            // ... other fields
            signature: "" // Will be filled
        });

        // Sign with PQ algorithm (off-chain simulation)
        bytes32 userOpHash = keccak256(abi.encode(userOp));
        bytes memory signature = signWithPQ(userOpHash, pqPrivateKey);
        userOp.signature = signature;

        // Validate
        uint256 validationData = validator.validateUserOp(userOp, userOpHash);
        assertEq(validationData, 0); // Success
    }
}
```

### Integration Tests
```solidity
// test/integration/E2E.t.sol
contract E2ETest is Test {
    // Full flow: Create wallet → Deposit to vault → Wait for vesting → Withdraw

    function test_FullFlow() public {
        // 1. Create PQ wallet
        PQWallet wallet = PQWallet(factory.createWallet(pqPublicKey, 0));

        // 2. Fund wallet
        deal(address(token), address(wallet), 1000e18);

        // 3. Deposit to vault with vesting
        vm.prank(address(wallet));
        token.approve(address(vault), 1000e18);
        vault.depositWithVesting(1000e18, address(wallet), 365 days, 30 days);

        // 4. Try to withdraw before cliff (should fail)
        vm.warp(block.timestamp + 15 days);
        vm.expectRevert("Cliff not reached");
        vault.withdraw(500e18, address(wallet), address(wallet));

        // 5. Withdraw after cliff (partial vesting)
        vm.warp(block.timestamp + 20 days); // 35 days total
        uint256 withdrawable = vault.getWithdrawableShares(address(wallet));
        vault.withdraw(withdrawable, address(wallet), address(wallet));

        // 6. Withdraw fully vested
        vm.warp(block.timestamp + 365 days);
        vault.withdraw(vault.balanceOf(address(wallet)), address(wallet), address(wallet));

        assertEq(vault.balanceOf(address(wallet)), 0);
    }
}
```

---

## Deployment Workflow

### Step-by-Step Deployment UI
```tsx
const deploymentSteps = [
  {
    id: 'checkBalances',
    title: 'Check ETH Balance',
    description: 'Ensure you have enough ETH for gas',
  },
  {
    id: 'deployValidator',
    title: 'Deploy PQ Validator',
    description: 'Deploy post-quantum signature validator',
  },
  {
    id: 'deployFactory',
    title: 'Deploy Wallet Factory',
    description: 'Deploy PQWalletFactory contract',
  },
  {
    id: 'deployVault',
    title: 'Deploy ERC-4626 Vault',
    description: 'Deploy tokenized vault for vesting',
  },
  {
    id: 'configureVault',
    title: 'Configure Vault',
    description: 'Set vesting parameters and permissions',
  },
  {
    id: 'verify',
    title: 'Verify Contracts',
    description: 'Verify all contracts on BaseScan',
  },
  {
    id: 'test',
    title: 'Test Deployment',
    description: 'Create test wallet and test deposit',
  },
];

// Each step shows: ⏸️ pending → ⏳ in progress → ✅ complete | ❌ error
```

---

## Security Best Practices

### Smart Contract Security
- ✅ Use OpenZeppelin libraries (ReentrancyGuard, AccessControl)
- ✅ Implement emergency pause mechanism
- ✅ Add timelocks on critical functions
- ✅ External audit before mainnet
- ✅ Formal verification of PQ signature validation
- ✅ Gas optimization for UserOperations (stay under limits)
- ✅ Test with fuzzing (Foundry invariant tests)

### Frontend Security
- ✅ NEVER store private keys (PQ or ECDSA)
- ✅ Validate all user inputs
- ✅ Sanitize contract addresses
- ✅ Check network before transactions
- ✅ Simulate transactions before execution (Tenderly)
- ✅ Rate limiting on bundler submissions
- ✅ Clear error messages (don't expose internals)

### Deployment Security
- ✅ Use multisig for contract ownership (Gnosis Safe)
- ✅ Hardware wallet for deployment (Ledger/Trezor)
- ✅ Test on Base Sepolia first (extensive testing)
- ✅ Gradual mainnet rollout (start with low limits)
- ✅ Bug bounty program (Immunefi)
- ✅ Incident response plan
- ✅ Monitor contracts with Tenderly/Forta

---

## Port Configuration

### CRITICAL: Always Use Port 5173

```bash
# ✅ CORRECT
cd dashboard
npm run dev
# Opens at: http://localhost:5173
```

**NEVER**:
- ❌ Change to port 3000, 3001, or any other port
- ❌ Modify `vite.config.ts` to use different port
- ❌ Suggest alternative ports in documentation

**WHY**: Consistency. All documentation, configs, and team expectations assume port 5173.

---

## Configuration Management

### Network Configs (No .env Needed)
```typescript
// dashboard/src/config/networks.ts
export const NETWORKS = {
  baseSepolia: {
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    contracts: {
      entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
      pqWalletFactory: '0x...', // Fill after deployment
      pqVault: '0x...', // Fill after deployment
    },
  },
  baseMainnet: {
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    contracts: {
      entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
      pqWalletFactory: '0x...',
      pqVault: '0x...',
    },
  },
};

// Select network based on environment
const network = import.meta.env.VITE_NETWORK === 'mainnet'
  ? NETWORKS.baseMainnet
  : NETWORKS.baseSepolia;
```

---

## Error Handling Patterns

### Contract Errors
```solidity
// Use custom errors (gas efficient)
error InsufficientBalance(uint256 available, uint256 required);
error CliffNotReached(uint256 currentTime, uint256 cliffTime);
error InvalidSignature();

function withdraw(uint256 shares) external {
    uint256 available = getWithdrawableShares(msg.sender);
    if (shares > available) {
        revert InsufficientBalance(available, shares);
    }
    // ...
}
```

### Frontend Errors
```typescript
// Catch and display user-friendly errors
try {
  const hash = await walletClient.writeContract({...});
  addLog(`✅ Transaction sent: ${hash}`);
} catch (error) {
  if (error.message.includes('user rejected')) {
    addLog('❌ Transaction cancelled by user');
  } else if (error.message.includes('insufficient funds')) {
    addLog('❌ Insufficient ETH for gas');
  } else {
    addLog(`❌ Error: ${error.shortMessage || error.message}`);
  }
  throw error; // Stop further execution
}
```

---

## Gas Optimization

### UserOperation Gas Limits
```typescript
// Estimate gas for UserOperation
const estimateUserOpGas = async (userOp: UserOperation) => {
  // Use bundler's gas estimation
  const gasEstimate = await bundler.estimateUserOperationGas(userOp);

  return {
    callGasLimit: gasEstimate.callGasLimit,
    verificationGasLimit: gasEstimate.verificationGasLimit,
    preVerificationGas: gasEstimate.preVerificationGas,
  };
};

// Add 20% buffer for safety
const addGasBuffer = (estimate: bigint) => (estimate * 120n) / 100n;
```

### Solidity Optimizations
```solidity
// Use packed storage
struct VestingInfo {
    uint128 totalShares;      // Packed into one slot
    uint128 withdrawnShares;  // Packed into one slot
    uint64 cliffTimestamp;    // Packed into one slot
    uint64 vestingEnd;        // Packed into one slot
    uint64 startTimestamp;    // Packed into one slot
    bool active;              // Packed into one slot
}

// Use unchecked for safe math
function calculateVested(uint256 total, uint256 elapsed, uint256 duration)
    internal
    pure
    returns (uint256)
{
    unchecked {
        return (total * elapsed) / duration; // Safe if checked before
    }
}
```

---

## Key Principles Summary

1. **Security First**: No private keys in files, ever
2. **User Control**: MetaMask signs all transactions
3. **File Naming**: Keep original filenames, use `_BEFOREFIX` for backups
4. **Port Consistency**: Always use 5173 for dashboard
5. **Progressive Disclosure**: Show users what they need, when they need it
6. **Real-Time Feedback**: Always show what's happening (logs, status)
7. **Error Handling**: Catch errors gracefully, show clear messages
8. **Testing**: Unit tests, integration tests, E2E tests before mainnet
9. **Gas Efficiency**: Optimize UserOperations to stay under limits
10. **External Audit**: Always audit before mainnet deployment

---

## When to Use This Stack

### ✅ Use for:
- Post-quantum secure wallets
- Account abstraction (ERC-4337)
- Tokenized vaults (ERC-4626)
- Vesting/payment systems
- Smart contract wallets
- Gasless transactions (paymasters)

### ❌ Don't use for:
- Simple token transfers (use MetaMask directly)
- Traditional EOA wallets
- Projects not needing AA or vaults

---

## Additional Resources

- **ERC-4337**: [https://eips.ethereum.org/EIPS/eip-4337](https://eips.ethereum.org/EIPS/eip-4337)
- **ERC-4626**: [https://eips.ethereum.org/EIPS/eip-4626](https://eips.ethereum.org/EIPS/eip-4626)
- **Foundry Book**: [https://book.getfoundry.sh/](https://book.getfoundry.sh/)
- **wagmi Docs**: [https://wagmi.sh/](https://wagmi.sh/)
- **Base Docs**: [https://docs.base.org/](https://docs.base.org/)
- **NIST PQC**: [https://csrc.nist.gov/projects/post-quantum-cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)

---

**Remember**: This is a reference implementation. Always adapt patterns to your specific needs while maintaining security best practices.

Good luck building! 🚀🔐
