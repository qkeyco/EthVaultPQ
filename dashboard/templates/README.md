# EthVaultPQ Vesting Schedule Templates

This directory contains example vesting schedule configurations in JSON format that can be imported into the EthVaultPQ dashboard.

## Available Templates

### 1. `vesting-60month-linear.json`
**5-Year Linear Vesting (No Cliff)**
- **Duration**: 60 months
- **Cliff**: None
- **Use Case**: Long-term team allocations
- **Vesting Rate**: 1.67% per month

### 2. `vesting-4year-cliff.json`
**4-Year Vesting with 1-Year Cliff**
- **Duration**: 48 months (4 years)
- **Cliff**: 12 months (1 year)
- **Use Case**: Investor/VC allocations
- **Vesting Rate**: 2.78% per month after cliff

### 3. `vesting-test-5minute.json`
**Test Mode - 5 Minute Vesting**
- **Duration**: 5 months (= 5 minutes in test mode)
- **Cliff**: None
- **Use Case**: Testing and demonstration
- **Mode**: Test (60x acceleration)
- **Real Time**: Complete vesting in 5 minutes

### 4. `vesting-multi-recipient.json`
**Multi-Recipient Example**
- **Recipients**: 4 recipients with different allocations
- **Split**: 40% / 30% / 20% / 10%
- **Use Case**: Team distributions with vault-to-vault vesting
- **Features**: Demonstrates multiple recipients and vault recipients

## How to Use Templates

### Method 1: Import via Dashboard
1. Go to the **Vesting** tab in the EthVaultPQ dashboard
2. Click **📂 Import File** button
3. Select a template JSON file
4. The schedule will be loaded into the builder
5. Modify recipient addresses (replace `0x000...` placeholders)
6. Adjust parameters as needed
7. Deploy the vesting schedule

### Method 2: Copy/Paste
1. Open a template file in your text editor
2. Copy the entire JSON content
3. In the dashboard Vesting tab, click **📋 Paste**
4. The schedule will be imported from your clipboard
5. Modify as needed

### Method 3: Use as Reference
Open a template file to understand the JSON schema structure and create your own custom schedules.

## Template Structure

All templates follow the EthVaultPQ Vesting Schedule JSON Schema v1.0.0:

```json
{
  "version": "1.0.0",
  "metadata": { /* Name, description, tags */ },
  "deployment": { /* Network, token info */ },
  "schedule": {
    "mode": "production" | "test",
    "preset": "60-month-linear" | "4-year-cliff" | "custom",
    "totalAmount": "string",
    "startTime": { /* Timestamp, block number */ },
    "cliff": { /* Cliff parameters */ },
    "vesting": { /* Vesting parameters */ },
    "rate": { /* Vesting rates */ }
  },
  "recipients": [ /* Array of recipients */ ],
  "security": { /* Security settings */ },
  "auditTrail": [ /* Action history */ ]
}
```

## Customizing Templates

### Important Fields to Modify

1. **`recipients[].address`**: Replace `0x0000...` with actual Ethereum addresses
2. **`recipients[].percentage`**: Adjust allocation percentages (must sum to 100%)
3. **`schedule.totalAmount`**: Set the total token amount to vest
4. **`schedule.startTime.timestamp`**: Set the vesting start date
5. **`deployment.tokenAddress`**: Use your token contract address
6. **`schedule.mode`**: Choose `"production"` or `"test"`

### Block-Based Vesting

EthVaultPQ uses **block numbers** (not timestamps) for vesting calculations to prevent miner manipulation:

- **Ethereum Mainnet**: 12 seconds per block
- **Test Mode**: 0.2 seconds per block (60x faster)

Block numbers are calculated automatically based on your chosen start time and duration.

## Creating Custom Schedules

### Example: 2-Year Advisor Vesting (6-month cliff)

```json
{
  "version": "1.0.0",
  "schedule": {
    "mode": "production",
    "preset": "custom",
    "cliff": {
      "durationMonths": 6
    },
    "vesting": {
      "durationMonths": 24
    }
  }
}
```

### Example: Vault-to-Vault Vesting

```json
{
  "recipients": [
    {
      "address": "0xYourVaultAddress",
      "percentage": 100,
      "isVault": true,
      "label": "Secondary Vesting Vault"
    }
  ]
}
```

## Validation

All imported schedules are automatically validated for:
- ✅ Recipients sum to exactly 100%
- ✅ Valid Ethereum addresses
- ✅ Cliff duration ≤ total vesting duration
- ✅ Maximum vesting duration ≤ 10 years
- ✅ Total amount > 0

Invalid schedules will be rejected with an error message.

## Export Your Own Templates

After configuring a schedule in the dashboard:
1. Click **💾 Export File** to download as JSON
2. Or click **📄 Copy** to copy to clipboard
3. Save the file in this directory for future use
4. Share with your team for consistent vesting setups

## Security Considerations

- **Never commit private keys** to template files
- **Review all parameters** before deployment
- **Verify recipient addresses** carefully
- **Test mode first** before production deployment
- **Audit trail** is automatically tracked in exported schedules

## Schema Documentation

Full schema documentation: `dashboard/src/types/VestingSchema.ts`

For questions or issues, see the main project README.
