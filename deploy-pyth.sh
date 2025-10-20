#!/bin/bash
set -e

echo "======================================"
echo "  EthVaultPQ - Pyth Deployment"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo ""
    echo "Creating .env from template..."
    cat > .env << 'EOF'
RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d
PRIVATE_KEY=
EOF
    echo -e "${YELLOW}Please edit .env and add your PRIVATE_KEY${NC}"
    echo "Then run this script again."
    exit 1
fi

# Load environment
source .env

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}Error: PRIVATE_KEY not set in .env${NC}"
    exit 1
fi

# Check if RPC URL is set
if [ -z "$RPC_URL" ]; then
    echo -e "${RED}Error: RPC_URL not set in .env${NC}"
    exit 1
fi

echo "Configuration:"
echo "  RPC: $RPC_URL"
echo "  Private Key: ${PRIVATE_KEY:0:10}...${PRIVATE_KEY: -4}"
echo ""

# Get deployer address
DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY)
echo "Deployer Address: $DEPLOYER"

# Check balance
BALANCE=$(cast balance $DEPLOYER --rpc-url $RPC_URL)
echo "Balance: $BALANCE wei"

if [ "$BALANCE" = "0" ]; then
    echo -e "${YELLOW}Warning: Balance is 0!${NC}"
    echo "Please fund your address at:"
    echo "https://dashboard.tenderly.co/explorer/vnet/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d"
    echo ""
    read -p "Press enter when funded..."
fi

echo ""
echo -e "${GREEN}Starting deployment...${NC}"
echo ""

# Deploy
forge script script/DeployPythOracle.s.sol:DeployPythOracle \
    --rpc-url $RPC_URL \
    --broadcast \
    --private-key $PRIVATE_KEY \
    -vvvv

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check the deployment output above for contract addresses"
echo "2. Update dashboard/src/config/contracts.ts with the addresses"
echo "3. Restart the dashboard: cd dashboard && npm run dev"
echo "4. Visit http://localhost:5175 and check the Oracles tab"
echo ""
