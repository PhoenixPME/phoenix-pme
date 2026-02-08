use cw2::set_contract_version;
use cosmwasm_std::*;
use crate::state::{AUCTION_COUNT, AUCTIONS, Auction, Bid, AuctionStatus, DEVELOPER_WALLET};
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};

const CONTRACT_NAME: &str = "crates.io:phoenix-escrow";
const CONTRACT_VERSION: &str = "1.0.0";

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    AUCTION_COUNT.save(deps.storage, &0)?;
    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("admin", msg.admin)
        .add_attribute("developer_wallet", DEVELOPER_WALLET))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    match msg {
        ExecuteMsg::CreateAuction {
            item_id,
            description,
            starting_price,
            reserve_price,
            duration_hours,
        } => execute_create_auction(
            deps, env, info, 
            item_id, description, starting_price, 
            reserve_price, duration_hours
        ),
        ExecuteMsg::PlaceBid { auction_id, amount } => 
            execute_place_bid(deps, env, info, auction_id, amount),
        ExecuteMsg::EndAuction { auction_id } => 
            execute_end_auction(deps, env, info, auction_id),
        _ => Err(StdError::generic_err("Unimplemented")),
    }
}

pub fn execute_create_auction(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    item_id: String,
    description: String,
    starting_price: Uint128,
    reserve_price: Option<Uint128>,
    duration_hours: u64,
) -> StdResult<Response> {
    // Validate inputs
    if starting_price.is_zero() {
        return Err(StdError::generic_err("Starting price must be > 0"));
    }
    
    // Get next auction ID
    let auction_id = AUCTION_COUNT.update(deps.storage, |count| -> StdResult<_> {
        Ok(count + 1)
    })?;
    
    // Create auction matching your struct definition
    let auction = Auction {
        seller: info.sender.to_string(),
        item_id,
        description,
        starting_price,
        reserve_price,
        start_time: env.block.time.seconds(),
        end_time: env.block.time.plus_seconds(duration_hours * 3600).seconds(),
        current_bid: None,
        bids: Vec::new(),
        status: AuctionStatus::Active,
        escrow_released: false,
    };
    
    // Save auction
    AUCTIONS.save(deps.storage, auction_id, &auction)?;
    
    // Return success
    Ok(Response::new()
        .add_attribute("action", "create_auction")
        .add_attribute("auction_id", auction_id.to_string())
        .add_attribute("seller", info.sender.to_string()))
}

pub fn execute_place_bid(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    auction_id: u64,
    amount: Uint128,
) -> StdResult<Response> {
    // Load auction
    let mut auction = AUCTIONS.load(deps.storage, auction_id)
        .map_err(|_| StdError::not_found("Auction"))?;
    
    // Validate auction is active
    if auction.status != AuctionStatus::Active {
        return Err(StdError::generic_err("Auction not active"));
    }
    
    // Check if auction hasn't ended
    if env.block.time.seconds() > auction.end_time {
        return Err(StdError::generic_err("Auction has ended"));
    }
    
    // Check if bid meets minimum
    let min_bid = match auction.current_bid {
        Some(ref current_bid) => current_bid.amount + Uint128::from(100u128), // 100 unit minimum increase
        None => auction.starting_price,
    };
    
    if amount < min_bid {
        return Err(StdError::generic_err(
            format!("Bid must be at least {}", min_bid)
        ));
    }
    
    // Create new bid
    let bid = Bid {
        bidder: info.sender.to_string(),
        amount,
        timestamp: env.block.time.seconds(),
    };
    
    // Update auction
    auction.current_bid = Some(bid.clone());
    auction.bids.push(bid);
    
    // Save updated auction
    AUCTIONS.save(deps.storage, auction_id, &auction)?;
    
    // Return success
    Ok(Response::new()
        .add_attribute("action", "place_bid")
        .add_attribute("auction_id", auction_id.to_string())
        .add_attribute("bidder", info.sender.to_string())
        .add_attribute("amount", amount.to_string()))
}

pub fn execute_end_auction(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    auction_id: u64,
) -> StdResult<Response> {
    // Load auction
    let mut auction = AUCTIONS.load(deps.storage, auction_id)
        .map_err(|_| StdError::not_found("Auction"))?;
    
    // Validate auction is active
    if auction.status != AuctionStatus::Active {
        return Err(StdError::generic_err("Auction already ended"));
    }
    
    // Check if sender is seller or auction has ended by time
    let is_seller = info.sender.to_string() == auction.seller;
    let is_time_expired = env.block.time.seconds() > auction.end_time;
    
    if !is_seller && !is_time_expired {
        return Err(StdError::generic_err(
            "Only seller can end auction early"
        ));
    }
    
    // Determine auction outcome
    let outcome = match &auction.current_bid {
        Some(bid) if bid.amount >= auction.reserve_price.unwrap_or_else(|| Uint128::zero()) => {
            auction.status = AuctionStatus::Sold;
            "sold"
        }
        Some(_) => {
            auction.status = AuctionStatus::EndedNoSale;
            "ended_no_sale"
        }
        None => {
            auction.status = AuctionStatus::EndedNoBids;
            "ended_no_bids"
        }
    };
    
    // Save updated auction
    AUCTIONS.save(deps.storage, auction_id, &auction)?;
    
    // Return result
    Ok(Response::new()
        .add_attribute("action", "end_auction")
        .add_attribute("auction_id", auction_id.to_string())
        .add_attribute("status", format!("{:?}", auction.status))
        .add_attribute("outcome", outcome))
}

// Query functions will go here
#[entry_point]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetAuction { auction_id } => {
            let auction = AUCTIONS.load(deps.storage, auction_id)?;
            to_json_binary(&auction)
        }
        QueryMsg::GetActiveAuctions {} => {
            let count = AUCTION_COUNT.load(deps.storage)?;
            let mut active_auctions = Vec::new();
            
            for i in 0..count {
                if let Ok(auction) = AUCTIONS.load(deps.storage, i) {
                    if auction.status == AuctionStatus::Active {
                        active_auctions.push(auction);
                    }
                }
            }
            
            to_json_binary(&active_auctions)
        }
        QueryMsg::GetAuctionCount {} => {
            let count = AUCTION_COUNT.load(deps.storage)?;
            to_json_binary(&count)
        }
    }
}
