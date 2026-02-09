# PhoenixPME - Precious Metals Exchange

## Overview
Blockchain-based auction platform for physical precious metals with integrated insurance funding mechanism.

## Core Components

### 1. Auction Platform
- **Purpose**: Peer-to-peer trading of physical precious metals
- **Fee**: 1.1% per successful transaction
- **Features**:
  - Buy It Now & bidding functionality
  - Real-time market data integration
  - Seller-set grading premiums
  - Coreum blockchain settlement

### 2. Fee Distribution
Every transaction collects 1.1%:
- **1.0%** → RLUSD insurance escrow (on XRPL) for future insurance program
- **0.1%** → Development escrow (also on XRPL, separate allocation)

**Important Disclosure**: Both allocations (1.0% + 0.1%) are placed in RLUSD escrow accounts. The developer maintains control over 1/10 of the total insurance pool.

### 3. Insurance Module (Future)
- **Activation**: When combined RLUSD escrows reach sufficient capital
- **Purpose**: Provide blockchain-based insurance for precious metals
- **Control Structure**: Developer retains 10% governance/control stake
- **Rate**: Will be competitive with traditional insurance (exact % TBD)

## Escrow Structure
- **Total Fee Collected**: 1.1% RLUSD
- **Insurance Pool**: 1.0% → General insurance capital
- **Developer Allocation**: 0.1% → Developer-controlled portion (10% of total pool)
- **Governance**: Developer maintains proportional control in escrow management

## Technical Architecture
- **Frontend**: React/TypeScript (port 3000)
- **Backend**: Express.js/PostgreSQL (port 3001)
- **Blockchain**: Coreum (CosmWasm smart contracts)
- **Insurance Services**: Ports 3200-3204 (calculator, risk assessment, quotes, RLUSD monitor)

## Current Status
- ✅ Auction platform functional (http://localhost:3000)
- ✅ Backend API operational (http://localhost:3001)
- ✅ Insurance module services ready (ports 3200-3204)
- 🔄 RLUSD escrow: Building capital (0 → 50,000 RLUSD goal)
- 🔄 Smart contract deployment: In progress

## Development
- **Repository**: https://github.com/PhoenixPME/coreum-pme
- **Primary Developer**: Greg (@greg-gzillion)
- **Contact**: gjf20842@gmail.com

## Key Files
- `apps/frontend/` - Auction interface
- `apps/backend/` - API server
- `apps/insurance-module/` - Insurance services
- `contracts/` - Coreum smart contracts
- `legal/` - License and commercial terms

## Notes
- Platform fee (1.1%) is mandatory in all implementations
- All fees are escrowed in RLUSD on XRPL
- Developer controls 10% of insurance pool via escrow allocations
- Insurance module activates automatically when RLUSD escrow reaches threshold
- Built for Coreum blockchain, compatible with upcoming tx (Coreum + Sologenic)
