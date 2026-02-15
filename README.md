

> 📦 **Looking for the latest version?** This project has been reorganized and is now actively maintained at **[greg-gzillion/TX](https://github.com/greg-gzillion/TX)**. The code here is stable but no longer updated.

# PhoenixPME - Precious Metals Exchange

## Overview
Blockchain-based auction platform for physical precious metals with integrated insurance funding mechanism.

## Core Components

### 1. Auction Platform
- **Purpose**: Peer-to-peer trading of physical precious metals
- **Fee**: 1.1% per successful transaction
For detailed fee model, see: docs/FEE_MODEL.md
- **Features**:
  - Buy It Now & bidding functionality
  - Real-time market data integration
  - Seller-set grading premiums
  - Coreum blockchain settlement

### 2. Fee Distribution
For detailed fee model, see: docs/FEE_MODEL.md
**Auction Platform Fees (1.1%):**
For detailed fee model, see: docs/FEE_MODEL.md
- **100% goes to insurance pool** (building capital for future insurance)
- **Developer stake**: 10% ownership of accumulated insurance pool

**Future Insurance Transaction Fees:**
For detailed fee model, see: docs/FEE_MODEL.md
- **10% to Developer** (per insurance transaction)
- **90% to Insurance Pool** (per insurance transaction)

### 3. Insurance Module (Future)
- **Activation**: When insurance pool reaches sufficient capital
- **Developer Stake**: 10% ownership of insurance pool
- **Insurance Fee**: Will be competitive percentage (TBD)
For detailed fee model, see: docs/FEE_MODEL.md
- **Developer Share**: 10% of all insurance transaction fees

## Financial Structure
**Phase 1: Building Capital (Current)**


## Implementation Details
- **Single escrow account**: All auction fees accumulate in insurance pool
- **Developer ownership**: 10% stake in total insurance pool
- **Future insurance**: Developer receives 10% of all insurance transaction fees
- **Transparency**: All allocations verifiable on XRPL ledger

## Technical Architecture
- **Frontend**: React/TypeScript (port 3000)
- **Backend**: Express.js/PostgreSQL (port 3001)
- **Blockchain**: Coreum (CosmWasm smart contracts)
- **Insurance Services**: Ports 3200-3204 (calculator, risk assessment, quotes, RLUSD monitor)

## Current Status
- ✅ Auction platform functional (http://localhost:3000)
- ✅ Backend API operational (http://localhost:3001)
- ✅ Insurance module services ready (ports 3200-3204)
- 🔄 Insurance pool: Building capital (0 → 50,000 RLUSD goal)
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
- Auction platform fee (1.1%) builds insurance capital
- Developer owns 10% stake in insurance pool
- When insurance launches: developer gets 10% of insurance transaction fees
- All fees escrowed in RLUSD on XRPL
- Insurance activates automatically when pool reaches threshold
- Built for Coreum blockchain, compatible with upcoming tx (Coreum + Sologenic)
Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.
No file chosen
Attach files by dragging & dropping, selecting or pasting them.

## Fee Model (Single Source of Truth)
For detailed fee model, see: docs/FEE_MODEL.md
See: legal/FEE_MODEL_SIMPLE.md


## Legal Status Facts

### Copyright:
- Code is original work by Greg (@greg-gzillion)
- Copyright exists automatically
- Licensed under GNU GPL v3.0

### Trademark:
- "PhoenixPME" name is in use
- Not a registered trademark
- Consider registration for formal protection

### Commercial Model:
- Open source code: GPL v3.0
- Potential revenue: Hosted service, consulting, custom development
- Competition: Others can fork under GPL terms

## 🪙 TESTUSD Token - Live on Coreum Testnet

We've successfully deployed the TESTUSD token as the foundation for our precious metals trading protocol.

- **Documentation:** [TESTUSD Token Creation](docs/TESTUSD_TOKEN_CREATION.md)
- **Transaction:** `37EC84596A02687D8F77E7D92538F518CCE847D8B4A325732B911FD0B0D35E9A`
- **Token:** TESTUSD (6 decimals, 1000 initial supply)

## 🪙 TESTUSD Token Status

✅ **LIVE ON COREM TESTNET**

The foundation token for PhoenixPME auctions is now operational.

- **Symbol:** TESTUSD
- **Denom:** `utestusd-testcore1tymxlev27p5rhxd36g4j3a82c7uucjjz4xuzc6`
- **Decimals:** 6
- **Created:** $(date)
- **Transaction:** [37EC84...5E9A](https://explorer.testnet-1.coreum.dev/coreum/transaction/37EC84596A02687D8F77E7D92538F518CCE847D8B4A325732B911FD0B0D35E9A)

See [docs/TESTUSD_TOKEN_CREATION.md](docs/TESTUSD_TOKEN_CREATION.md) for details.
