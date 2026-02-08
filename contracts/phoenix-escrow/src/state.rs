use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use cosmwasm_std::{Addr, Uint128, Timestamp};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Auction {
    pub seller: String,
    pub item_id: String,
    pub description: String,
    pub starting_price: Uint128,
    pub reserve_price: Option<Uint128>,
    pub start_time: u64,
    pub end_time: u64,
    pub current_bid: Option<Bid>,
    pub bids: Vec<Bid>,
    pub status: AuctionStatus,
    pub escrow_released: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Bid {
    pub bidder: String,
    pub amount: Uint128,
    pub timestamp: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub enum AuctionStatus {
    Active,
    Sold,
    EndedNoSale,
    EndedNoBids,
    Cancelled,
}

// Storage
use cosmwasm_std::StdResult;
use cw_storage_plus::{Item, Map};

pub const DEVELOPER_WALLET: &str = "coreum1v4f8s9z4h7j0q3x6k5w8n2r1t0y7u6i5o4p3l2k9j8h7g6f5";
pub const AUCTION_COUNT: Item<u64> = Item::new("auction_count");
pub const AUCTIONS: Map<u64, Auction> = Map::new("auctions");
