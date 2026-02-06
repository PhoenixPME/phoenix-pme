use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Uint128};
use cw_storage_plus::{Item, Map};

#[cw_serde]
pub struct Auction {
    pub id: u64,
    pub seller: Addr,
    pub item_description: String,
    pub starting_price: Uint128,
    pub current_bid: Option<Bid>,
    pub status: AuctionStatus,
    pub end_time: u64, // Unix timestamp
    pub created_at: u64,
}

#[cw_serde]
pub struct Bid {
    pub bidder: Addr,
    pub amount: Uint128,
    pub placed_at: u64,
}

#[cw_serde]
pub enum AuctionStatus {
    Active,
    Ended,
    Disputed,
    Completed,
}

// Storage
pub const AUCTION_COUNT: Item<u64> = Item::new("auction_count");
pub const AUCTIONS: Map<u64, Auction> = Map::new("auctions");
