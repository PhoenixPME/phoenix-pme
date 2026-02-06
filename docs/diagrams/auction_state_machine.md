# PhoenixPME Auction Escrow: State Machine Specification

## 1. Overview
The PhoenixPME Auction Escrow is a state machine that manages the lifecycle of a peer-to-peer physical precious metals trade. Its primary purpose is to **custody funds securely** and **enforce rules transparently** until both parties fulfill their obligations. Security is initiated by a seller bond.

## 2. Definitions
- **Seller Bond (Security Deposit)**: Funds locked by the seller to guarantee performance (shipment of described item). Forfeited in whole or part for bad faith actions.
- **Reserve Price**: The minimum sale price set by the seller. The auction only succeeds if a bid meets or exceeds this amount.
- **Winning Bid**: The highest valid bid at the close of the auction.

## 3. Core States & Transitions

### State: `AWAITING_SELLER_BOND`
**Purpose:** The initial state. Ensures the seller has "skin in the game" before the auction is publicly listed, thwarting fake or non-committal listings.

**Parameters & Storage:**
- `seller_bond_amount`: Calculated as a percentage (e.g., 120%) of the seller's `reserve_price` or a fixed minimum.
- `seller_bond_deadline`: A timer (e.g., 24 hours). If the bond is not posted, the listing is cancelled.

**Valid Triggers & Next States:**
1.  `SELLER_DEPOSITS_BOND` → `LISTING_ACTIVE`
    - The seller successfully locks the required bond with the smart contract.
    - The auction listing becomes visible to buyers.
2.  `SELLER_CANCELS` → `CANCELLED`
    - The seller chooses not to proceed before the bond deadline.
    - No penalty, as no bond was locked.
3.  `BOND_DEADLINE_EXPIRED` → `CANCELLED`
    - The `seller_bond_deadline` passes without a deposit.
    - The listing is automatically invalidated.

**On-Chain Logic:**
- The contract must verify the deposited asset (e.g., COREUM, XRP) and amount matches `seller_bond_amount`.
- The bonded funds are held in escrow until the auction concludes in `COMPLETE`, `CANCELLED` (by seller before bids), or `DISPUTE_RESOLVED`.

---
