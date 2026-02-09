use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},
    
    #[error("Auction not found")]
    AuctionNotFound {},
    
    #[error("Auction already ended")]
    AuctionEnded {},
    
    #[error("Bid too low")]
    BidTooLow {},
    
    #[error("Reserve price not met")]
    ReserveNotMet {},
    
    #[error("Buy now price not specified")]
    NoBuyNowPrice {},
    
    #[error("Auction not active")]
    AuctionNotActive {},
    
    #[error("Insufficient funds")]
    InsufficientFunds {},
    
    #[error("Only creator can cancel")]
    NotCreator {},
    
    #[error("Auction already has bids")]
    AuctionHasBids {},
    
    // KYC errors
    #[error("KYC verification required")]
    KycRequired {},
    
    #[error("Address is blacklisted")]
    Blacklisted {},
}
