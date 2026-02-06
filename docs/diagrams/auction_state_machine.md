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

### State: `LISTING_ACTIVE`
**Purpose:** The auction is live and visible. Buyers can place bids or trigger a "Buy It Now" if the seller has set that option.

**Parameters & Storage:**
- `reserve_price`: The minimum price to win.
- `buy_it_now_price`: (Optional) If set by the seller, a price at which any buyer can instantly win.
- `auction_end_time`: The timestamp when bidding closes.
- `current_highest_bid` & `current_winning_bidder`: Tracks the leading bid.

**Valid Triggers & Next States:**
1.  `BUYER_TRIGGERS_BUY_IT_NOW` → `AWAITING_PAYMENT`
    - **Condition:** `buy_it_now_price` must be set.
    - **Action:** The triggering buyer must immediately lock the `buy_it_now_price` as payment. The auction closes instantly.
2.  `BUYER_PLACES_BID` → (Remains in `LISTING_ACTIVE`)
    - **Condition:** Bid must be > `current_highest_bid` and >= `reserve_price`.
    - **Action:** The previous highest bid is refunded. The new bid is locked in escrow.
3.  `AUCTION_TIMER_EXPIRES` → `BIDDING_CLOSED`
    - **Condition:** `auction_end_time` is reached.
    - **Action:** Bidding closes. If the `current_highest_bid` >= `reserve_price`, the auction proceeds to settlement. If not, it proceeds to cancellation.
4.  `SELLER_CANCELS` → `CANCELLED`
    - **Condition:** Typically only allowed if *no bids have been placed*, to prevent abuse.
    - **Action:** The seller's bond is returned. Any bids are refunded.

**On-Chain Logic:**
- The contract must manage the locking and refunding of bid amounts with each new higher bid.
- If `buy_it_now_price` is triggered, the contract must validate and lock the full payment before transitioning.

---

### State: `BIDDING_CLOSED`
**Purpose:** The bidding period is over. The contract determines the outcome and directs the state machine.

**Parameters & Storage:**
- `current_highest_bid`: The winning bid amount.
- `current_winning_bidder`: The address of the winner.
- `reserve_price`: For final validation.

**Valid Triggers & Next States:**
1.  `RESERVE_MET` → `AWAITING_WINNER_PAYMENT`
    - **Condition:** `current_highest_bid` >= `reserve_price`.
    - **Action:** The winner is bound to lock the payment. All other bids are refunded.
2.  `RESERVE_NOT_MET` → `CANCELLED_NO_WINNER`
    - **Condition:** `current_highest_bid` < `reserve_price`.
    - **Action:** The seller's bond is returned. All bids are refunded. The listing ends.

**On-Chain Logic:**
- This is primarily a validation and routing state. The actual financial movements (refunds) happen here.

### State: `AWAITING_WINNER_PAYMENT`
**Purpose:** The winning bidder must convert their winning bid into the **settlement asset** (e.g., XRP) and lock it with the escrow contract. This is the buyer's "skin in the game."

**Parameters & Storage:**
- `payment_amount`: Equal to `current_highest_bid` (converted to settlement asset value).
- `payment_asset`: The designated settlement asset (e.g., XRP, a SOLO-wrapped asset).
- `payment_deadline`: A timer (e.g., 24-48 hours) for the winner to act.

**Mechanics (The Cross-Chain Flow):**
1.  The Coreum escrow contract holds instructions: "Winner must send `payment_amount` of `payment_asset` to escrow address X."
2.  The winner obtains the asset (e.g., buys XRP on an exchange, uses Sologenic to convert another token to XRP).
3.  The winner sends the asset to the designated escrow address **on the XRPL** (or another settlement chain).
4.  A **bridge oracle** or **IBC relay** confirms the locked payment to the Coreum contract.

**Valid Triggers & Next States:**
1.  `WINNER_LOCKS_PAYMENT` → `AWAITING_SHIPMENT`
    - **Condition:** The escrow contract receives verified proof that `payment_amount` is locked in the settlement layer.
    - **Action:** The seller is notified to proceed with shipment. The buyer's funds are now locked in escrow.
2.  `PAYMENT_DEADLINE_EXPIRED` → `CANCELLED_WINNER_DEFAULT`
    - **Condition:** The `payment_deadline` passes without confirmation.
    - **Action:** The auction is cancelled. The **seller's bond is returned**. The **winning bidder may forfeit their initial bid deposit** (if one was required during bidding) as a penalty for non-payment.

**On-Chain Logic:**
- This state requires secure **cross-chain verification** (via IBC or a trusted oracle). This is one of the protocol's core technical challenges.

---

### State: `AWAITING_SHIPMENT`
**Purpose:** The buyer's payment is locked. The seller must now ship the physical item according to the protocol's rules.

**Parameters & Storage:**
- `shipment_deadline`: A timer (e.g., 3-5 business days) for the seller to provide proof of shipment.
- `allowed_carrier`: Protocol-enforced. Initially: `"USPS"`.
- `allowed_destination_region`: Protocol-enforced. Initially: `"US-Lower48"`.

**Valid Triggers & Next States:**
1.  `SELLER_SUBMITS_SHIPMENT_PROOF` → `IN_TRANSIT`
    - **Condition:** Seller submits a valid USPS tracking number. An **oracle service** must verify:
        a. The tracking number is valid and active.
        b. The destination is within the `allowed_destination_region`.
    - **Action:** The state moves to `IN_TRANSIT`. The shipping countdown begins.
2.  `SHIPMENT_DEADLINE_EXPIRED` → `DISPUTE_SELLER_DEFAULT`
    - **Condition:** `shipment_deadline` passes without verified proof.
    - **Action:** This is treated as seller failure. The buyer's locked payment is refunded in full. The **seller's bond is forfeited** to the buyer as compensation.

**On-Chain Logic:**
- Relies on an external **Shipping Oracle** to validate USPS tracking data. This oracle is a critical trust component.

### State: `IN_TRANSIT`
**Purpose:** The item is en route. The system is waiting for either delivery confirmation or a problem.

**Parameters & Storage:**
- `tracking_number`: The verified USPS tracking ID.
- `delivery_confirmation_deadline`: A timer based on USPS estimated delivery + a buffer (e.g., +7 days).
- `last_verified_scan`: Updated by the Shipping Oracle.

**Valid Triggers & Next States:**
1.  `CARRIER_CONFIRMS_DELIVERY` → `AWAITING_BUYER_CONFIRMATION`
    - **Condition:** The Shipping Oracle reports a "Delivered" status from USPS for the `tracking_number`.
    - **Action:** The buyer now has a final window to confirm the item matches the description.
2.  `DELIVERY_TIMEOUT_EXPIRED` → `DISPUTE_IN_TRANSIT`
    - **Condition:** The `delivery_confirmation_deadline` passes without a "Delivered" scan.
    - **Action:** A dispute is automatically raised. Funds remain locked pending investigation (was it lost? stalled?).

**On-Chain Logic:**
- The contract periodically polls or receives updates from the Shipping Oracle.
- This state exposes the protocol to **real-world carrier delays and errors**, which must be handled by the dispute system.

---

### State: `AWAITING_BUYER_CONFIRMATION`
**Purpose:** The item is marked as delivered. The buyer has a final window to inspect it and raise a formal challenge if it is materially different from the listing (e.g., fake, damaged, wrong item).

**Parameters & Storage:**
- `delivery_timestamp`: When the oracle reported "Delivered".
- `buyer_challenge_deadline`: `delivery_timestamp` + 72 hours.
- `seller_payout_address`: Where funds will be sent upon successful completion.

**Valid Triggers & Next States:**
1.  `BUYER_CONFIRMS_SATISFACTION` → `COMPLETE`
    - **Action:** Buyer actively signals approval. The locked payment is released to the seller. The seller's bond is returned. The auction concludes successfully.
2.  `BUYER_RAISES_DISCREPANCY` → `DISPUTE_MATERIAL_DISCREPANCY`
    - **Condition:** Buyer submits an on-chain challenge before the `buyer_challenge_deadline`. This must include **stake** (a small dispute fee) and **evidence** (photos, description of issue).
    - **Action:** All funds (buyer's payment, seller's bond) remain frozen. A structured dispute resolution process begins.
3.  `BUYER_CHALLENGE_DEADLINE_EXPIRES` → `COMPLETE`
    - **Condition:** The 72-hour window passes with no action from the buyer.
    - **Action:** This is interpreted as **silent acceptance**. The locked payment is automatically released to the seller. The seller's bond is returned. *This protects the seller from being held hostage.*

**On-Chain Logic:**
- The 72-hour timer is critical and must be enforced on-chain.
- The transition to `COMPLETE` on deadline expiry must be automatic.

### State: `DISPUTE_MATERIAL_DISCREPANCY`
**Purpose:** A formal process to adjudicate a buyer's claim that the received item is not as described.

**Parameters & Storage:**
- `dispute_raiser`: The buyer's address.
- `dispute_stake`: A fee deposited by the buyer to raise the dispute (discourages frivolous claims).
- `dispute_evidence_uri`: Link to buyer-submitted evidence (photos, videos) stored on IPFS.
- `resolution_deadline`: Timer for the resolution process.

**Proposed Resolution Mechanism:**
1.  **Escalation Path:**
    - **Step 1: Peer Review.** The dispute details (with evidence) are published anonymously to a pool of other verified `PhoenixPME` users (e.g., other sellers). They vote on the outcome.
    - **Step 2: Designated Expert.** If peer review is inconclusive or challenged, the case and a higher fee are escalated to a pre-approved, bonded third-party expert (e.g., a professional numismatist for coins).
2.  **Valid Triggers & Next States:**
    - `DISPUTE_RESOLVED_FOR_BUYER` → `COMPLETE_BUYER_REFUNDED`
        - **Condition:** Dispute resolver finds in favor of the buyer.
        - **Action:** The buyer's full payment is refunded. The buyer receives the seller's **entire bond** as compensation. The buyer's `dispute_stake` is returned.
    - `DISPUTE_RESOLVED_FOR_SELLER` → `COMPLETE`
        - **Condition:** Dispute resolver finds in favor of the seller (item is as described).
        - **Action:** The seller receives the full payment. The seller's bond is returned. The buyer's `dispute_stake` is **forfeited to the seller** as a penalty for a bad-faith challenge.
    - `RESOLUTION_DEADLINE_EXPIRES` → `DISPUTE_TIMEOUT`
        - **Condition:** No resolution is achieved within the `resolution_deadline`.
        - **Action:** This is a failure state. A conservative default is to refund the buyer (protection) but **not award the bond**. The seller's bond is returned. This penalizes both parties for failing to resolve.

**On-Chain Logic:**
- This is the most complex part of the contract, requiring a curated reviewer list, voting mechanics, and escalation logic.
- **Version 1 Suggestion:** Start with a simple, manual escalation to a single, trusted "Protocol Guardian" multisig to keep initial complexity low, with a roadmap to decentralize.

---
