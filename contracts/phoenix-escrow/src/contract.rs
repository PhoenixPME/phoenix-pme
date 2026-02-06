use cosmwasm_std::{
    entry_point, to_json_binary, Binary, Deps, DepsMut, Env, MessageInfo, 
    Response, StdResult, Uint128,
};
use cw2::set_contract_version;

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
use crate::state::{Auction, Bid, AuctionStatus, AUCTION_COUNT, AUCTIONS};

// version info for migration info
const CONTRACT_NAME: &str = "crates.io:phoenix-escrow";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    
    // Initialize auction count to 0
    AUCTION_COUNT.save(deps.storage, &0u64)?;
    
    // If owner specified, save it (optional for now)
    let owner = msg.owner.unwrap_or_else(|| info.sender.to_string());
    
    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", owner))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::CreateAuction { item_description, starting_price, duration_days } => {
            execute_create_auction(deps, env, info, item_description, starting_price, duration_days)
        }
        ExecuteMsg::PlaceBid { auction_id } => {
            execute_place_bid(deps, env, info, auction_id)
        }
        ExecuteMsg::EndAuction { auction_id } => {
            execute_end_auction(deps, env, info, auction_id)
        }
        ExecuteMsg::ReleaseToSeller { auction_id } => {
            execute_release_to_seller(deps, info, auction_id)
        }
        ExecuteMsg::DisputeAuction { auction_id, reason } => {
            execute_dispute_auction(deps, info, auction_id, reason)
        }
    }
}

fn execute_create_auction(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    item_description: String,
    starting_price: Uint128,
    duration_days: u64,
) -> Result<Response, ContractError> {
    // Validate input
    if item_description.is_empty() {
        return Err(ContractError::InvalidInput("Item description cannot be empty".to_string()));
    }
    if starting_price.is_zero() {
        return Err(ContractError::InvalidInput("Starting price must be greater than 0".to_string()));
    }
    if duration_days == 0 || duration_days > 365 {
        return Err(ContractError::InvalidInput("Duration must be between 1 and 365 days".to_string()));
    }
    
    // Get next auction ID
    let auction_id = AUCTION_COUNT.load(deps.storage)?;
    let new_auction_id = auction_id + 1;
    
    // Calculate end time (current time + duration in seconds)
    let end_time = env.block.time.seconds() + (duration_days * 24 * 60 * 60);
    
    // Create auction
    let auction = Auction {
        id: new_auction_id,
        seller: info.sender.clone(),
        item_description,
        starting_price,
        current_bid: None,
        status: AuctionStatus::Active,
        end_time,
        created_at: env.block.time.seconds(),
    };
    
    // Save auction
    AUCTIONS.save(deps.storage, new_auction_id, &auction)?;
    
    // Update auction count
    AUCTION_COUNT.save(deps.storage, &new_auction_id)?;
    
    Ok(Response::new()
        .add_attribute("method", "create_auction")
        .add_attribute("auction_id", new_auction_id.to_string())
        .add_attribute("seller", info.sender))
}

fn execute_place_bid(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    auction_id: u64,
) -> Result<Response, ContractError> {
    // Load auction
    let mut auction = AUCTIONS.load(deps.storage, auction_id)
        .map_err(|_| ContractError::AuctionNotFound(auction_id))?;
    
    // Check auction is active
    if !matches!(auction.status, AuctionStatus::Active) {
        return Err(ContractError::AuctionNotActive(auction_id));
    }
    
    // Check auction hasn't ended
    if env.block.time.seconds() > auction.end_time {
        return Err(ContractError::AuctionEnded(auction_id));
    }
    
    // Check sent funds (bid amount)
    let sent_funds = info.funds.iter()
        .find(|coin| coin.denom == "utest")  // Coreum test token
        .map(|coin| coin.amount)
        .unwrap_or_else(Uint128::zero);
    
    if sent_funds.is_zero() {
        return Err(ContractError::InvalidInput("No funds sent with bid".to_string()));
    }
    
    // Check bid is higher than current bid or starting price
    let min_bid = auction.current_bid
        .as_ref()
        .map(|bid| bid.amount)
        .unwrap_or(auction.starting_price);
    
    if sent_funds <= min_bid {
        return Err(ContractError::InvalidInput(format!(
            "Bid must be higher than current bid: {} > {}",
            sent_funds, min_bid
        )));
    }
    
    // Create new bid
    let new_bid = Bid {
        bidder: info.sender.clone(),
        amount: sent_funds,
        placed_at: env.block.time.seconds(),
    };
    
    // Update auction
    auction.current_bid = Some(new_bid);
    AUCTIONS.save(deps.storage, auction_id, &auction)?;
    
    Ok(Response::new()
        .add_attribute("method", "place_bid")
        .add_attribute("auction_id", auction_id.to_string())
        .add_attribute("bidder", info.sender)
        .add_attribute("amount", sent_funds.to_string()))
}

fn execute_end_auction(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    auction_id: u64,
) -> Result<Response, ContractError> {
    let mut auction = AUCTIONS.load(deps.storage, auction_id)
        .map_err(|_| ContractError::AuctionNotFound(auction_id))?;
    
    // Only seller can end auction early
    if info.sender != auction.seller {
        return Err(ContractError::Unauthorized {});
    }
    
    // Check auction is active
    if !matches!(auction.status, AuctionStatus::Active) {
        return Err(ContractError::AuctionNotActive(auction_id));
    }
    
    // Update status
    auction.status = AuctionStatus::Ended;
    AUCTIONS.save(deps.storage, auction_id, &auction)?;
    
    Ok(Response::new()
        .add_attribute("method", "end_auction")
        .add_attribute("auction_id", auction_id.to_string())
        .add_attribute("status", "ended"))
}

fn execute_release_to_seller(
    deps: DepsMut,
    info: MessageInfo,
    auction_id: u64,
) -> Result<Response, ContractError> {
    let mut auction = AUCTIONS.load(deps.storage, auction_id)
        .map_err(|_| ContractError::AuctionNotFound(auction_id))?;
    
    // Only seller can release
    if info.sender != auction.seller {
        return Err(ContractError::Unauthorized {});
    }
    
    // Check auction has ended
    if !matches!(auction.status, AuctionStatus::Ended) {
        return Err(ContractError::AuctionNotEnded(auction_id));
    }
    
    // Update status to completed
    auction.status = AuctionStatus::Completed;
    AUCTIONS.save(deps.storage, auction_id, &auction)?;
    
    Ok(Response::new()
        .add_attribute("method", "release_to_seller")
        .add_attribute("auction_id", auction_id.to_string())
        .add_attribute("status", "completed"))
}

fn execute_dispute_auction(
    deps: DepsMut,
    info: MessageInfo,
    auction_id: u64,
    reason: String,
) -> Result<Response, ContractError> {
    let mut auction = AUCTIONS.load(deps.storage, auction_id)
        .map_err(|_| ContractError::AuctionNotFound(auction_id))?;
    
    // Only buyer or seller can dispute
    let is_buyer = auction.current_bid.as_ref()
        .map(|bid| bid.bidder == info.sender)
        .unwrap_or(false);
    
    if info.sender != auction.seller && !is_buyer {
        return Err(ContractError::Unauthorized {});
    }
    
    // Update status to disputed
    auction.status = AuctionStatus::Disputed;
    AUCTIONS.save(deps.storage, auction_id, &auction)?;
    
    Ok(Response::new()
        .add_attribute("method", "dispute_auction")
        .add_attribute("auction_id", auction_id.to_string())
        .add_attribute("disputer", info.sender)
        .add_attribute("reason", reason)
        .add_attribute("status", "disputed"))
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetAuction { id } => to_json_binary(&query_auction(deps, id)?),
        QueryMsg::ListAuctions { start_after, limit } => {
            to_json_binary(&query_list_auctions(deps, start_after, limit)?)
        }
        QueryMsg::GetAuctionCount {} => to_json_binary(&query_auction_count(deps)?),
    }
}

fn query_auction(deps: Deps, id: u64) -> StdResult<Auction> {
    AUCTIONS.load(deps.storage, id)
}

fn query_list_auctions(
    deps: Deps,
    start_after: Option<u64>,
    limit: Option<u32>,
) -> StdResult<Vec<Auction>> {
    let limit = limit.unwrap_or(10) as usize;
    let start = start_after.map(|id| id + 1).unwrap_or(1);
    
    let mut auctions = Vec::new();
    let max_id = AUCTION_COUNT.load(deps.storage)?;
    
    for id in start..=max_id {
        if auctions.len() >= limit {
            break;
        }
        if let Ok(auction) = AUCTIONS.load(deps.storage, id) {
            auctions.push(auction);
        }
    }
    
    Ok(auctions)
}

fn query_auction_count(deps: Deps) -> StdResult<u64> {
    AUCTION_COUNT.load(deps.storage)
}

#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{coins, from_json, Addr, StdError, Uint128};
    
    const TEST_CREATOR: &str = "creator";
    const TEST_BIDDER: &str = "bidder";
    const TEST_TOKEN: &str = "utest";

    #[test]
    fn test_instantiate() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        let info = mock_info(TEST_CREATOR, &[]);
        
        let msg = InstantiateMsg { owner: None };
        let res = instantiate(deps.as_mut(), env, info, msg).unwrap();
        
        assert_eq!(res.attributes[0].value, "instantiate");
        
        // Check auction count is initialized to 0
        let count = AUCTION_COUNT.load(&deps.storage).unwrap();
        assert_eq!(count, 0);
    }

    #[test]
    fn test_create_auction_success() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        let info = mock_info(TEST_CREATOR, &[]);
        
        // Instantiate
        let msg = InstantiateMsg { owner: None };
        instantiate(deps.as_mut(), env.clone(), info.clone(), msg).unwrap();
        
        // Create auction
        let msg = ExecuteMsg::CreateAuction {
            item_description: "1oz Gold Bar".to_string(),
            starting_price: Uint128::new(1000),
            duration_days: 7,
        };
        
        let res = execute(deps.as_mut(), env.clone(), info, msg).unwrap();
        
        // Check response
        assert_eq!(res.attributes[0].value, "create_auction");
        assert_eq!(res.attributes[1].value, "1"); // auction_id = 1
        assert_eq!(res.attributes[2].value, TEST_CREATOR);
        
        // Check auction count increased
        let count = AUCTION_COUNT.load(&deps.storage).unwrap();
        assert_eq!(count, 1);
        
        // Verify auction was saved
        let auction: Auction = AUCTIONS.load(&deps.storage, 1).unwrap();
        assert_eq!(auction.id, 1);
        assert_eq!(auction.item_description, "1oz Gold Bar");
        assert_eq!(auction.starting_price, Uint128::new(1000));
        assert!(matches!(auction.status, AuctionStatus::Active));
    }

    #[test]
    fn test_create_auction_validation_errors() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        let info = mock_info(TEST_CREATOR, &[]);
        
        let msg = InstantiateMsg { owner: None };
        instantiate(deps.as_mut(), env.clone(), info.clone(), msg).unwrap();
        
        // Test 1: Empty description should fail
        let msg = ExecuteMsg::CreateAuction {
            item_description: "".to_string(),
            starting_price: Uint128::new(1000),
            duration_days: 7,
        };
        
        let res = execute(deps.as_mut(), env.clone(), info.clone(), msg);
        assert!(res.is_err());
        
        // Test 2: Zero price should fail
        let msg = ExecuteMsg::CreateAuction {
            item_description: "1oz Gold Bar".to_string(),
            starting_price: Uint128::zero(),
            duration_days: 7,
        };
        
        let res = execute(deps.as_mut(), env.clone(), info.clone(), msg);
        assert!(res.is_err());
        
        // Test 3: Zero duration should fail
        let msg = ExecuteMsg::CreateAuction {
            item_description: "1oz Gold Bar".to_string(),
            starting_price: Uint128::new(1000),
            duration_days: 0,
        };
        
        let res = execute(deps.as_mut(), env.clone(), info.clone(), msg);
        assert!(res.is_err());
        
        // Test 4: Too long duration should fail
        let msg = ExecuteMsg::CreateAuction {
            item_description: "1oz Gold Bar".to_string(),
            starting_price: Uint128::new(1000),
            duration_days: 400,
        };
        
        let res = execute(deps.as_mut(), env, info, msg);
        assert!(res.is_err());
    }

    #[test]
    fn test_query_auction() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        let info = mock_info(TEST_CREATOR, &[]);
        
        // Setup
        let msg = InstantiateMsg { owner: None };
        instantiate(deps.as_mut(), env.clone(), info.clone(), msg).unwrap();
        
        // Create auction
        let msg = ExecuteMsg::CreateAuction {
            item_description: "1oz Gold Bar".to_string(),
            starting_price: Uint128::new(1000),
            duration_days: 7,
        };
        
        execute(deps.as_mut(), env.clone(), info, msg).unwrap();
        
        // Query auction
        let msg = QueryMsg::GetAuction { id: 1 };
        let res = query(deps.as_ref(), env.clone(), msg).unwrap();
        let auction: Auction = from_json(res).unwrap();
        
        assert_eq!(auction.id, 1);
        assert_eq!(auction.item_description, "1oz Gold Bar");
        assert_eq!(auction.starting_price, Uint128::new(1000));
        assert!(matches!(auction.status, AuctionStatus::Active));
    }

    #[test]
    fn test_query_auction_count() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        let info = mock_info(TEST_CREATOR, &[]);
        
        // Setup
        let msg = InstantiateMsg { owner: None };
        instantiate(deps.as_mut(), env.clone(), info.clone(), msg).unwrap();
        
        // Create two auctions
        let msg = ExecuteMsg::CreateAuction {
            item_description: "Auction 1".to_string(),
            starting_price: Uint128::new(1000),
            duration_days: 7,
        };
        execute(deps.as_mut(), env.clone(), info.clone(), msg).unwrap();
        
        let msg = ExecuteMsg::CreateAuction {
            item_description: "Auction 2".to_string(),
            starting_price: Uint128::new(2000),
            duration_days: 3,
        };
        execute(deps.as_mut(), env.clone(), info, msg).unwrap();
        
        // Query count
        let msg = QueryMsg::GetAuctionCount {};
        let res = query(deps.as_ref(), env, msg).unwrap();
        let count: u64 = from_json(res).unwrap();
        
        assert_eq!(count, 2);
    }
}
