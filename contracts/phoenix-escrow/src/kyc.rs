use cosmwasm_std::{Deps, DepsMut, Env, MessageInfo, Response, StdResult, Addr, Uint128};
use crate::state::{KycRecord, KYC_REGISTRY, BLACKLIST, CONFIG};
use crate::error::ContractError;

// Check if address is KYC verified
pub fn is_kyc_verified(deps: Deps, address: &Addr, required_level: u8) -> Result<bool, ContractError> {
    // Check blacklist first
    if BLACKLIST.has(deps.storage, address) {
        return Err(ContractError::Blacklisted {});
    }
    
    // Get KYC record
    match KYC_REGISTRY.may_load(deps.storage, address)? {
        Some(record) => {
            // Check if expired
            if let Some(expires_at) = record.expires_at {
                if expires_at < env.block.time.seconds() {
                    return Err(ContractError::KycExpired {});
                }
            }
            
            // Check level
            if record.level < required_level {
                return Err(ContractError::InsufficientKycLevel {
                    required: required_level,
                    has: record.level,
                });
            }
            
            Ok(record.verified)
        }
        None => Ok(false),
    }
}

// Verify a user's KYC
pub fn verify_kyc(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    address: Addr,
    level: u8,
    expires_in_days: Option<u64>,
) -> Result<Response, ContractError> {
    // Only admin can verify KYC
    let config = CONFIG.load(deps.storage)?;
    if info.sender != config.admin {
        return Err(ContractError::Unauthorized {});
    }
    
    // Calculate expiry
    let expires_at = expires_in_days.map(|days| env.block.time.seconds() + days * 24 * 60 * 60);
    
    // Save KYC record
    let record = KycRecord {
        address: address.clone(),
        verified: true,
        level,
        verified_at: env.block.time.seconds(),
        verified_by: info.sender.clone(),
        expires_at,
    };
    
    KYC_REGISTRY.save(deps.storage, &address, &record)?;
    
    Ok(Response::new()
        .add_attribute("action", "verify_kyc")
        .add_attribute("address", address)
        .add_attribute("level", level.to_string())
        .add_attribute("verified_by", info.sender))
}

// Blacklist an address
pub fn blacklist_address(
    deps: DepsMut,
    info: MessageInfo,
    address: Addr,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;
    if info.sender != config.admin {
        return Err(ContractError::Unauthorized {});
    }
    
    BLACKLIST.save(deps.storage, &address, &true)?;
    
    Ok(Response::new()
        .add_attribute("action", "blacklist_address")
        .add_attribute("address", address)
        .add_attribute("blacklisted_by", info.sender))
}
