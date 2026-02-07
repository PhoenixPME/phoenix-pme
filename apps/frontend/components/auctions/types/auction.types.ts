export type MetalType = 'Gold' | 'Silver' | 'Platinum' | 'Palladium' | 'Other';
export type FormType = 'coin' | 'round' | 'bar' | 'jewelry' | 'other';
export type WeightUnit = 'troy_oz' | 'grams' | 'ounces';
export type GradingService = 'PCGS' | 'NGC' | 'ANACS' | 'ICG' | 'Other' | 'None';

export interface AuctionItem {
  // Basic Info
  metalType: MetalType;
  formType: FormType;
  weight: number;
  weightUnit: WeightUnit;
  purity: number; // 0.999, 0.925, etc.
  
  // Item Details
  itemName: string;
  description: string;
  year?: number;
  mint?: string;
  serialNumber?: string;
  
  // Certification
  isGraded: boolean;
  gradingService?: GradingService;
  grade?: string; // MS70, PR69, etc.
  certificationNumber?: string;
  
  // Pricing
  spotPrice: number; // Seller sets current spot
  premiumPercent: number; // -20 to +100%
  isNumismatic: boolean;
  numismaticPremium?: number; // 0-500%
  
  // Images
  images: string[]; // Base64 or IPFS hashes
  
  // Seller Info
  sellerAddress: string;
  location?: string;
  requiresShipping: boolean;
  
  // Auction Settings
  startingPrice: number;
  buyNowPrice?: number;
  currency: 'TEST' | 'USDC' | 'XRP' | 'CORE';
  auctionDuration: number; // hours
  createdAt: Date;
}

// Phase 2: Detailed item information
export interface AuctionItemDetails {
  // Physical Characteristics
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: 'mm' | 'cm' | 'inches';
  };
  
  // Mint Information
  mintYear?: number;
  mintMark?: string;
  countryOfOrigin?: string;
  
  // Condition
  condition?: 'Uncirculated' | 'Brilliant' | 'Proof' | 'Circulated' | 'Worn';
  hasPackaging?: boolean;
  packagingType?: 'Original' | 'Aftermarket' | 'None';
  
  // Authentication
  hasCOA?: boolean;
  assayed?: boolean;
  assayNumber?: string;
}

// Combined interface for complete auction data
export interface CompleteAuctionData extends AuctionItem, AuctionItemDetails {}
