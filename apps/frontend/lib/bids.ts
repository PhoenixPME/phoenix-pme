export interface Bid {
  id: string;
  auctionId: string;
  amount: number;
  bidder: string;
  timestamp: string;
}

export class BidManager {
  static saveBid(auctionId: string, amount: number, bidder: string = 'You') {
    const bid: Bid = {
      id: 'bid_' + Date.now(),
      auctionId,
      amount,
      bidder,
      timestamp: new Date().toISOString(),
    };
    
    const bids = this.getAuctionBids(auctionId);
    bids.push(bid);
    
    // Sort by highest bid first
    bids.sort((a, b) => b.amount - a.amount);
    
    localStorage.setItem(`bids_${auctionId}`, JSON.stringify(bids));
    
    // Update auction current price
    const auctionKey = this.findAuctionKey(auctionId);
    if (auctionKey) {
      const auction = JSON.parse(localStorage.getItem(auctionKey) || '{}');
      auction.currentPrice = amount;
      localStorage.setItem(auctionKey, JSON.stringify(auction));
    }
    
    return bid;
  }
  
  static getAuctionBids(auctionId: string): Bid[] {
    const bidsJson = localStorage.getItem(`bids_${auctionId}`);
    return bidsJson ? JSON.parse(bidsJson) : [];
  }
  
  static getHighestBid(auctionId: string): Bid | null {
    const bids = this.getAuctionBids(auctionId);
    return bids.length > 0 ? bids[0] : null;
  }
  
  static getBidCount(auctionId: string): number {
    return this.getAuctionBids(auctionId).length;
  }
  
  private static findAuctionKey(auctionId: string): string | null {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('auction_')) {
        const auction = JSON.parse(localStorage.getItem(key) || '{}');
        if (auction.title && auction.title.includes(auctionId)) {
          return key;
        }
      }
    }
    return null;
  }
}
