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

