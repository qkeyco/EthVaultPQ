# EthVaultPQ Snap Integration Guide

## 🎯 Overview

This guide shows how to integrate the EthVaultPQ MetaMask Snap into your DApp.

## 📋 Prerequisites

- MetaMask Flask (for development) or MetaMask v11+ (for production)
- Node.js 18+
- Basic knowledge of MetaMask Snaps API

## 🚀 Installation in Your DApp

### 1. Install MetaMask Snaps SDK

```bash
npm install @metamask/providers
```

### 2. Request Snap Installation

```typescript
// utils/snap.ts
export const SNAP_ID = '@ethvaultpq/snap';

export async function installSnap() {
  try {
    const snapInstalled = await window.ethereum.request({
      method: 'wallet_requestSnaps',
      params: {
        [SNAP_ID]: {}
      }
    });

    console.log('Snap installed:', snapInstalled);
    return true;
  } catch (error) {
    console.error('Failed to install snap:', error);
    return false;
  }
}

export async function isSnapInstalled(): Promise<boolean> {
  try {
    const snaps = await window.ethereum.request({
      method: 'wallet_getSnaps'
    });

    return Object.keys(snaps).includes(SNAP_ID);
  } catch (error) {
    return false;
  }
}
```

### 3. Create Snap Client

```typescript
// utils/snapClient.ts
import { SNAP_ID } from './snap';

export class EthVaultPQSnapClient {
  private snapId: string;

  constructor(snapId: string = SNAP_ID) {
    this.snapId = snapId;
  }

  private async request(method: string, params?: any) {
    return await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: this.snapId,
        request: {
          method,
          params
        }
      }
    });
  }

  // Wallet Management
  async createWallet() {
    return this.request('pqwallet_createWallet');
  }

  async getPublicKey(): Promise<string> {
    return this.request('pqwallet_getPublicKey');
  }

  async getWalletAddress(): Promise<string> {
    return this.request('pqwallet_getWalletAddress');
  }

  // Transaction Signing
  async signTransaction(transaction: {
    to: string;
    data: string;
    value?: string;
    chainId: number;
  }) {
    return this.request('pqwallet_signTransaction', { transaction });
  }

  async signMessage(message: string) {
    return this.request('pqwallet_signMessage', { message });
  }

  // Vault Management
  async getVaults() {
    return this.request('pqwallet_getVaults');
  }

  async getVestingSchedule(vaultAddress: string, currentBlock?: number) {
    return this.request('pqwallet_getVestingSchedule', {
      vaultAddress,
      currentBlock
    });
  }

  async addVault(vaultAddress: string, tokenAddress: string, tokenSymbol?: string) {
    return this.request('pqwallet_addVault', {
      vaultAddress,
      tokenAddress,
      tokenSymbol
    });
  }

  async removeVault(vaultAddress: string) {
    return this.request('pqwallet_removeVault', { vaultAddress });
  }

  // Utility
  async getSnapState() {
    return this.request('pqwallet_getSnapState');
  }

  async resetSnap() {
    return this.request('pqwallet_resetSnap');
  }
}
```

## 💼 Usage Examples

### React Component Example

```tsx
// components/PQWalletManager.tsx
import React, { useState, useEffect } from 'react';
import { installSnap, isSnapInstalled } from '../utils/snap';
import { EthVaultPQSnapClient } from '../utils/snapClient';

export function PQWalletManager() {
  const [snapClient] = useState(() => new EthVaultPQSnapClient());
  const [installed, setInstalled] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [vaults, setVaults] = useState<any[]>([]);

  useEffect(() => {
    checkSnapInstallation();
  }, []);

  async function checkSnapInstallation() {
    const isInstalled = await isSnapInstalled();
    setInstalled(isInstalled);

    if (isInstalled) {
      try {
        const address = await snapClient.getWalletAddress();
        setWalletAddress(address);

        const userVaults = await snapClient.getVaults();
        setVaults(userVaults);
      } catch (error) {
        console.error('Wallet not initialized:', error);
      }
    }
  }

  async function handleInstallSnap() {
    const success = await installSnap();
    if (success) {
      setInstalled(true);
    }
  }

  async function handleCreateWallet() {
    try {
      const result = await snapClient.createWallet();
      setWalletAddress(result.address);
      alert(`Wallet created! Address: ${result.address}`);
    } catch (error) {
      console.error('Failed to create wallet:', error);
      alert('Failed to create wallet');
    }
  }

  async function handleAddVault() {
    const vaultAddress = prompt('Enter vault address:');
    const tokenAddress = prompt('Enter token address:');
    const tokenSymbol = prompt('Enter token symbol (optional):');

    if (!vaultAddress || !tokenAddress) return;

    try {
      await snapClient.addVault(vaultAddress, tokenAddress, tokenSymbol || undefined);
      const userVaults = await snapClient.getVaults();
      setVaults(userVaults);
      alert('Vault added successfully!');
    } catch (error) {
      console.error('Failed to add vault:', error);
      alert('Failed to add vault');
    }
  }

  if (!installed) {
    return (
      <div className="p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">EthVaultPQ Snap</h2>
        <p className="mb-4">Install the Snap to manage PQ vaults</p>
        <button
          onClick={handleInstallSnap}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Install Snap
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">PQ Wallet Manager</h2>

      {!walletAddress ? (
        <div className="mb-4">
          <p className="mb-2">No PQ wallet found</p>
          <button
            onClick={handleCreateWallet}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create PQ Wallet
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Wallet Address:</p>
            <p className="font-mono text-sm">{walletAddress}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Tracked Vaults ({vaults.length})</h3>
            {vaults.length === 0 ? (
              <p className="text-sm text-gray-600">No vaults tracked</p>
            ) : (
              <ul className="space-y-2">
                {vaults.map((vault) => (
                  <li key={vault.address} className="p-2 bg-gray-50 rounded">
                    <p className="text-sm font-mono">{vault.address}</p>
                    <p className="text-xs text-gray-600">
                      {vault.tokenSymbol}: {vault.totalAmount}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleAddVault}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Add Vault
          </button>
        </>
      )}
    </div>
  );
}
```

### Vesting Schedule Display

```tsx
// components/VestingSchedule.tsx
import React, { useState, useEffect } from 'react';
import { EthVaultPQSnapClient } from '../utils/snapClient';

interface Props {
  vaultAddress: string;
}

export function VestingSchedule({ vaultAddress }: Props) {
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const snapClient = new EthVaultPQSnapClient();

  useEffect(() => {
    loadSchedule();
    const interval = setInterval(loadSchedule, 12000); // Update every block
    return () => clearInterval(interval);
  }, [vaultAddress]);

  async function loadSchedule() {
    try {
      const data = await snapClient.getVestingSchedule(vaultAddress);
      setSchedule(data);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!schedule) return <div>No schedule found</div>;

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Vesting Schedule</h3>

      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-600 h-4 rounded-full transition-all"
            style={{ width: `${schedule.vestingProgress}%` }}
          />
        </div>
        <p className="text-sm text-center mt-1">
          {schedule.vestingProgress.toFixed(1)}% Complete
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="font-semibold">{formatAmount(schedule.totalAmount)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Vested</p>
          <p className="font-semibold">{formatAmount(schedule.vestedAmount)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Claimable</p>
          <p className="font-semibold text-green-600">
            {formatAmount(schedule.claimableAmount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Claimed</p>
          <p className="font-semibold">{formatAmount(schedule.claimedAmount)}</p>
        </div>
      </div>
    </div>
  );
}

function formatAmount(amount: bigint): string {
  return (Number(amount) / 1e18).toFixed(4);
}
```

## 🔐 Security Best Practices

1. **Always check Snap installation**
   ```typescript
   if (!(await isSnapInstalled())) {
     await installSnap();
   }
   ```

2. **Handle errors gracefully**
   ```typescript
   try {
     const result = await snapClient.signTransaction(tx);
   } catch (error) {
     if (error.code === 'NOT_INITIALIZED') {
       // Prompt user to create wallet
     }
   }
   ```

3. **Validate user input**
   ```typescript
   if (!ethers.isAddress(vaultAddress)) {
     throw new Error('Invalid vault address');
   }
   ```

4. **Don't expose secret keys**
   - Never request or display secret keys
   - Only use public key and address

## 📱 Mobile Support

MetaMask Mobile supports Snaps! Use WalletConnect for mobile connections:

```typescript
// Mobile detection
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
  // Use WalletConnect or MetaMask deep linking
  window.location.href = `https://metamask.app.link/dapp/${window.location.href}`;
}
```

## 🐛 Debugging

Enable debug mode:

```typescript
// In browser console
localStorage.setItem('DEBUG', '@metamask/snaps-*');
```

Check Snap logs in MetaMask:
1. Open MetaMask
2. Settings → Advanced → Developer Options
3. View Snap Logs

## 📚 Additional Resources

- [MetaMask Snaps Documentation](https://docs.metamask.io/snaps/)
- [EthVaultPQ Contracts](https://github.com/ethvaultpq/contracts)
- [Example DApp](https://github.com/ethvaultpq/example-dapp)

## 🤝 Support

- Discord: https://discord.gg/ethvaultpq
- GitHub Issues: https://github.com/ethvaultpq/ethvaultpq-snap/issues
- Email: support@ethvaultpq.com
