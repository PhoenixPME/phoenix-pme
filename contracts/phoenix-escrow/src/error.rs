use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Auction not found: {0}")]
    AuctionNotFound(u64),

    #[error("Auction not active: {0}")]
    AuctionNotActive(u64),

    #[error("Auction has ended: {0}")]
    AuctionEnded(u64),

    #[error("Auction not ended: {0}")]
    AuctionNotEnded(u64),

    #[error("Invalid input: {0}")]
    InvalidInput(String),
}
