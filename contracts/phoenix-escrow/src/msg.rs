use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::Uint128;
use crate::state::Auction;  // Only import what's actually used

#[cw_serde]
pub struct InstantiateMsg {
    pub owner: Option<String>,
}

#[cw_serde]
pub enum ExecuteMsg {
    CreateAuction {
        item_description: String,
        starting_price: Uint128,
        duration_days: u64,
    },
    PlaceBid {
        auction_id: u64,
    },
    EndAuction {
        auction_id: u64,
    },
    ReleaseToSeller {
        auction_id: u64,
    },
    DisputeAuction {
        auction_id: u64,
        reason: String,
    },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(Auction)]
    GetAuction { id: u64 },
    #[returns(Vec<Auction>)]
    ListAuctions { start_after: Option<u64>, limit: Option<u32> },
    #[returns(u64)]
    GetAuctionCount {},
}
