use cosmwasm_std::{Addr, Uint128};
use cw_storage_plus::{Item, Map};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    pub admin: Addr,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub enum AuctionStatus {
    Active,
    Ended,
    Cancelled,
    Completed,
}

// Simple types for categorization
pub type MetalType = String;
pub type ProductForm = String;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Auction {
    pub id: u64,
    pub item_id: String,
    pub description: String,
    pub metal_type: MetalType,
    pub product_form: ProductForm,
    pub weight: u32,
    pub starting_price: Uint128,
    pub reserve_price: Option<Uint128>,
    pub buy_now_price: Option<cosmwasm_std::Uint128>,
    pub highest_bid: Option<Uint128>,
    pub highest_bidder: Option<Addr>,
    pub seller: Addr,
    pub status: AuctionStatus,
    pub end_time: cosmwasm_std::Timestamp,
    pub created_at: cosmwasm_std::Timestamp,
}

pub const CONFIG: Item<Config> = Item::new("config");
pub const AUCTION_COUNT: Item<u64> = Item::new("auction_count");
pub const AUCTIONS: Map<u64, Auction> = Map::new("auctions");
