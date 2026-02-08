use cw2::set_contract_version;
use cosmwasm_std::*;
use crate::state::{AUCTION_COUNT, AUCTIONS, Auction, Bid, AuctionStatus, MetalType, ProductForm, WeightUnit, DEVELOPER_WALLET};
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};

const CONTRACT_NAME: &str = "crates.io:phoenix-escrow";
const CONTRACT_VERSION: &str = "1.0.0";

// ========== INSTANTIATE ==========
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

// ========== EXECUTE ==========
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
            metal_type,
            product_form,
            weight,
            weight_unit,
            purity_percent,
            brand,
            year,
            graded,
            grade,
            cert_number,
            starting_price,
            reserve_price,
            duration_hours,
        } => execute_create_auction(
            deps, env, info,
            item_id, description, metal_type, product_form, weight, weight_unit,
            purity_percent, brand, year, graded, grade, cert_number,
            starting_price, reserve_price, duration_hours
        ),
        ExecuteMsg::PlaceBid { auction_id, amount } => 
            execute_place_bid(deps, env, info, auction_id, amount),
        ExecuteMsg::EndAuction { auction_id } => 
            execute_end_auction(deps, env, info, auction_id),
        ExecuteMsg::ReleaseEscrow { auction_id } =>
            execute_release_escrow(deps, env, info, auction_id),
        ExecuteMsg::CancelAuction { auction_id } =>
            execute_cancel_auction(deps, env, info, auction_id),
    }
}

// ========== CREATE AUCTION ==========
pub fn execute_create_auction(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    item_id: String,
    description: String,
    metal_type: MetalType,
    product_form: ProductForm,
    weight: u64,
    weight_unit: WeightUnit,
    purity_percent: u8,
    brand: Option<String>,
    year: Option<u16>,
    graded: bool,
    grade: Option<String>,
    cert_number: Option<String>,
    starting_price: Uint128,
    reserve_price: Option<Uint128>,
    duration_hours: u64,
) -> StdResult<Response> {
    // Validate
    if starting_price.is_zero() {
        return Err(StdError::generic_err("Starting price must be > 0"));
    }
    if weight == 0 {
        return Err(StdError::generic_err("Weight must be > 0"));
    }
    if purity_percent == 0 || purity_percent > 100 {
        return Err(StdError::generic_err("Purity must be 1-100%"));
    }
    if graded && (grade.is_none() || cert_number.is_none()) {
        return Err(StdError::generic_err("Graded items need grade and cert"));
    }
    
    // Get auction ID
    let auction_id = AUCTION_COUNT.update(deps.storage, |count| -> StdResult<_> {
        Ok(count + 1)
    })?;
    
    // Create auction
    let auction = Auction {
        seller: info.sender.to_string(),
        item_id,
        description,
        metal_type: metal_type.clone(),
        product_form: product_form.clone(),
        weight,
        weight_unit: weight_unit.clone(),
        purity_percent,
        brand: brand.clone(),
        year,
        graded,
        grade: grade.clone(),
        cert_number: cert_number.clone(),
        starting_price,
        reserve_price,
        start_time: env.block.time.seconds(),
        end_time: env.block.time.plus_seconds(duration_hours * 3600).seconds(),
        current_bid: None,
        bids: Vec::new(),
        status: AuctionStatus::Active,
        escrow_released: false,
    };
    
    // Save
    AUCTIONS.save(deps.storage, auction_id, &auction)?;
    
    // Response
    let mut res = Response::new()
        .add_attribute("action", "create_auction")
        .add_attribute("auction_id", auction_id.to_string())
        .add_attribute("seller", info.sender)
        .add_attribute("metal", format!("{:?}", metal_type.clone()))
        .add_attribute("form", format!("{:?}", product_form.clone()))
        .add_attribute("weight", weight.to_string());
    
    if graded {
        res = res
            .add_attribute("graded", "true")
            .add_attribute("grade", grade.clone().unwrap());
    }
    
    Ok(res)
}

// ========== PLACE BID ==========
pub fn execute_place_bid(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    auction_id: u64,
    amount: Uint128,
) -> StdResult<Response> {
    let mut auction = AUCTIONS.load(deps.storage, auction_id)
        .map_err(|_| StdError::not_found("Auction"))?;
    
    if auction.status != AuctionStatus::Active {
        return Err(StdError::generic_err("Auction not active"));
    }
    if env.block.time.seconds() > auction.end_time {
        return Err(StdError::generic_err("Auction ended"));
    }
    
    let bid = Bid {
        bidder: info.sender.to_string(),
        amount,
        timestamp: env.block.time.seconds(),
    };
    
    auction.current_bid = Some(bid.clone());
    auction.bids.push(bid);
    
    AUCTIONS.save(deps.storage, auction_id, &auction)?;
    
    Ok(Response::new()
        .add_attribute("action", "place_bid")
        .add_attribute("auction_id", auction_id.to_string())
        .add_attribute("bidder", info.sender)
        .add_attribute("amount", amount.to_string()))
}

// ========== END AUCTION ==========
pub fn execute_end_auction(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    auction_id: u64,
) -> StdResult<Response> {
    let mut auction = AUCTIONS.load(deps.storage, auction_id)
        .map_err(|_| StdError::not_found("Auction"))?;
    
    if auction.status != AuctionStatus::Active {
        return Err(StdError::generic_err("Auction already ended"));
    }
    
    let is_seller = info.sender == auction.seller;
    let is_time_expired = env.block.time.seconds() > auction.end_time;
    
    if !is_seller && !is_time_expired {
        return Err(StdError::generic_err("Only seller can end early"));
    }
    
    let outcome = match &auction.current_bid {
        Some(bid) if bid.amount >= auction.reserve_price.unwrap_or_else(Uint128::zero) => {
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
    
    AUCTIONS.save(deps.storage, auction_id, &auction)?;
    
    Ok(Response::new()
        .add_attribute("action", "end_auction")
        .add_attribute("auction_id", auction_id.to_string())
        .add_attribute("status", format!("{:?}", auction.status))
        .add_attribute("outcome", outcome))
}

// ========== RELEASE ESCROW ==========
pub fn execute_release_escrow(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    auction_id: u64,
) -> StdResult<Response> {
    let mut auction = AUCTIONS.load(deps.storage, auction_id)
        .map_err(|_| StdError::not_found("Auction"))?;
    
    if info.sender != auction.seller {
        return Err(StdError::generic_err("Only seller can release"));
    }
    if auction.status != AuctionStatus::Sold {
        return Err(StdError::generic_err("Auction not sold"));
    }
    if auction.escrow_released {
        return Err(StdError::generic_err("Escrow already released"));
    }
    
    auction.escrow_released = true;
    AUCTIONS.save(deps.storage, auction_id, &auction)?;
    
    Ok(Response::new()
        .add_attribute("action", "release_escrow")
        .add_attribute("auction_id", auction_id.to_string())
        .add_attribute("seller", auction.seller))
}

// ========== CANCEL AUCTION ==========
pub fn execute_cancel_auction(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    auction_id: u64,
) -> StdResult<Response> {
    let mut auction = AUCTIONS.load(deps.storage, auction_id)
        .map_err(|_| StdError::not_found("Auction"))?;
    
    if info.sender != auction.seller {
        return Err(StdError::generic_err("Only seller can cancel"));
    }
    if auction.status != AuctionStatus::Active {
        return Err(StdError::generic_err("Auction not active"));
    }
    if !auction.bids.is_empty() {
        return Err(StdError::generic_err("Cannot cancel with bids"));
    }
    
    auction.status = AuctionStatus::Cancelled;
    AUCTIONS.save(deps.storage, auction_id, &auction)?;
    
    Ok(Response::new()
        .add_attribute("action", "cancel_auction")
        .add_attribute("auction_id", auction_id.to_string())
        .add_attribute("seller", auction.seller))
}

// ========== QUERY ==========
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
            let mut active = Vec::new();
            for i in 0..count {
                if let Ok(auction) = AUCTIONS.load(deps.storage, i) {
                    if auction.status == AuctionStatus::Active {
                        active.push(auction);
                    }
                }
            }
            to_json_binary(&active)
        }
        QueryMsg::GetAuctionsByMetal { metal_type } => {
            let count = AUCTION_COUNT.load(deps.storage)?;
            let mut filtered = Vec::new();
            for i in 0..count {
                if let Ok(auction) = AUCTIONS.load(deps.storage, i) {
                    if auction.metal_type == metal_type && auction.status == AuctionStatus::Active {
                        filtered.push(auction);
                    }
                }
            }
            to_json_binary(&filtered)
        }
        QueryMsg::GetAuctionsByForm { product_form } => {
            let count = AUCTION_COUNT.load(deps.storage)?;
            let mut filtered = Vec::new();
            for i in 0..count {
                if let Ok(auction) = AUCTIONS.load(deps.storage, i) {
                    if auction.product_form == product_form && auction.status == AuctionStatus::Active {
                        filtered.push(auction);
                    }
                }
            }
            to_json_binary(&filtered)
        }
        QueryMsg::GetAuctionsByMetalAndForm { metal_type, product_form } => {
            let count = AUCTION_COUNT.load(deps.storage)?;
            let mut filtered = Vec::new();
            for i in 0..count {
                if let Ok(auction) = AUCTIONS.load(deps.storage, i) {
                    if auction.metal_type == metal_type && 
                       auction.product_form == product_form && 
                       auction.status == AuctionStatus::Active {
                        filtered.push(auction);
                    }
                }
            }
            to_json_binary(&filtered)
        }
        QueryMsg::GetGradedAuctions { graded } => {
            let count = AUCTION_COUNT.load(deps.storage)?;
            let mut filtered = Vec::new();
            for i in 0..count {
                if let Ok(auction) = AUCTIONS.load(deps.storage, i) {
                    if auction.graded == graded && auction.status == AuctionStatus::Active {
                        filtered.push(auction);
                    }
                }
            }
            to_json_binary(&filtered)
        }
        QueryMsg::GetAuctionCount {} => {
            let count = AUCTION_COUNT.load(deps.storage)?;
            to_json_binary(&count)
        }
    }
}

// ========== TESTS ==========
#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::coins;
    use crate::state::{MetalType, ProductForm, WeightUnit};

    #[test]
    fn test_instantiate() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        let info = mock_info("admin", &coins(1000, "ucore"));
        
        let msg = InstantiateMsg { admin: "admin".to_string() };
        let res = instantiate(deps.as_mut(), env, info, msg).unwrap();
        assert_eq!(res.attributes[0].value, "instantiate");
        println!("✅ Instantiate test passed");
    }
    
    #[test]
    fn test_create_platinum_bar_auction() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        
        // Instantiate
        let info = mock_info("admin", &[]);
        let msg = InstantiateMsg { admin: "admin".to_string() };
        instantiate(deps.as_mut(), env.clone(), info, msg).unwrap();
        
        // Create platinum bar auction
        let info = mock_info("seller", &[]);
        let msg = ExecuteMsg::CreateAuction {
            item_id: "platinum_bar_1oz".to_string(),
            description: "1oz Platinum Bar .9995".to_string(),
            metal_type: MetalType::Platinum,
            product_form: ProductForm::Bar,
            weight: 31,
            weight_unit: WeightUnit::Grams,
            purity_percent: 99,
            brand: Some("PAMP Suisse".to_string()),
            year: Some(2023),
            graded: false,
            grade: None,
            cert_number: None,
            starting_price: Uint128::from(100000u128),
            reserve_price: Some(Uint128::from(110000u128)),
            duration_hours: 72,
        };
        
        let res = execute(deps.as_mut(), env, info, msg).unwrap();
        assert_eq!(res.attributes[0].value, "create_auction");
        assert_eq!(res.attributes[3].value, "Platinum");
        assert_eq!(res.attributes[4].value, "Bar");
        println!("✅ Platinum bar auction test passed");
    }
    
    #[test]
    fn test_create_palladium_coin_auction() {
        println!("✅ Palladium coin auction test stub");
    }
    
    #[test]
    fn test_place_bid() {
        println!("✅ Place bid test stub");
    }
    
    #[test]
    fn test_end_auction() {
        println!("✅ End auction test stub");
    }
}
