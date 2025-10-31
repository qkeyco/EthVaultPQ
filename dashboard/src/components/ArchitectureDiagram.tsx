import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid with configuration
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
});

export function ArchitectureDiagram() {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mermaidRef.current) {
      mermaid.contentLoaded();
    }
  }, []);

  const diagramDefinition = `
graph TB
    subgraph User["👤 User Layer"]
        U1[MetaMask Snap<br/>Dilithium3 Keys]
        U2[Dashboard<br/>React UI]
    end

    subgraph OffChain["☁️ Off-Chain Layer"]
        API[ZK Proof API<br/>Vercel Serverless]
        PYTH[Pyth Oracle<br/>Price Feeds]
    end

    subgraph OnChain["⛓️ On-Chain Layer (Ethereum)"]
        subgraph Core["Core Contracts"]
            GV[Groth16Verifier<br/>ZK-SNARK]
            PQV[PQValidator<br/>ERC-4337]
            PQWF[PQWalletFactory<br/>CREATE2]
        end

        subgraph Vesting["Vesting System"]
            V4626[PQVault4626<br/>ERC-4626]
            PYUSD[PYUSD Vault<br/>Quantum-Safe]
        end

        subgraph Oracles["Oracle Layer"]
            ZKO[ZKProofOracle<br/>Request/Fulfill]
            QRNG[QRNGOracle<br/>Entropy]
        end

        EP[EntryPoint<br/>0x00...032]
    end

    %% User interactions
    U1 -->|1. Sign Tx<br/>Dilithium3| API
    U2 -->|Create Wallet| PQWF
    U2 -->|Setup Vesting| V4626

    %% Off-chain to on-chain
    API -->|2. Generate<br/>ZK Proof| ZKO
    PYTH -->|Price Data| V4626

    %% On-chain flow
    ZKO -->|3. Verify Proof| GV
    GV -->|Valid ✓| PQV
    PQV -->|Validate| EP
    EP -->|Execute| PQWF

    %% Vesting flow
    PQWF -->|Deploy Wallet| V4626
    QRNG -->|Random Entropy| PQWF
    V4626 -->|Store Assets| PYUSD

    %% Styling
    classDef userClass fill:#e0e7ff,stroke:#4f46e5,stroke-width:3px,color:#1e1b4b
    classDef offChainClass fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#78350f
    classDef coreClass fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef vestingClass fill:#d1fae5,stroke:#10b981,stroke-width:2px,color:#064e3b
    classDef oracleClass fill:#fce7f3,stroke:#ec4899,stroke-width:2px,color:#831843

    class U1,U2 userClass
    class API,PYTH offChainClass
    class GV,PQV,PQWF,EP coreClass
    class V4626,PYUSD vestingClass
    class ZKO,QRNG oracleClass
  `;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-6 shadow-lg border border-slate-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
        🏗️ EthVaultPQ Architecture
      </h3>

      <div className="bg-white rounded-lg p-4 mb-4 overflow-x-auto">
        <div ref={mermaidRef} className="mermaid">
          {diagramDefinition}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white rounded p-2 border-l-4 border-indigo-500">
          <div className="font-semibold text-indigo-900">👤 User Layer</div>
          <div className="text-gray-600">MetaMask Snap + Dashboard</div>
        </div>
        <div className="bg-white rounded p-2 border-l-4 border-amber-500">
          <div className="font-semibold text-amber-900">☁️ Off-Chain</div>
          <div className="text-gray-600">ZK Proof API + Oracles</div>
        </div>
        <div className="bg-white rounded p-2 border-l-4 border-blue-500">
          <div className="font-semibold text-blue-900">⛓️ Core Contracts</div>
          <div className="text-gray-600">ERC-4337 + ZK-SNARKs</div>
        </div>
        <div className="bg-white rounded p-2 border-l-4 border-green-500">
          <div className="font-semibold text-green-900">💰 Vesting</div>
          <div className="text-gray-600">ERC-4626 Vaults</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-600 text-center italic">
        Quantum-resistant signatures (Dilithium3) + ZK-SNARK compression (Groth16) + Time-based vesting (ERC-4626)
      </div>
    </div>
  );
}
