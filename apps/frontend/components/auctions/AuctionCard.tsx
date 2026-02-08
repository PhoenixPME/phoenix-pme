'use client';

import { useState } from 'react';
import { BidManager } from '@/lib/bids';

interface Auction {
  title: string;
  description: string;
  startingPrice: number;
  buyNowPrice?: number;
  metalType: string;
  weight: number;
  purity: number;
  endTime: string;
  images: { src: string; name: string }[];
  createdAt: string;
}

interface AuctionCardProps {
  auction: Auction;
  auctionNumber: number;
}

export default function AuctionCard({ auction, auctionNumber }: AuctionCardProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Soon';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Soon';
    }
  };

  const formatWeight = (grams: number) => {
    const troyOz = grams / 31.1035;
    return `${troyOz.toFixed(2)} oz t`;
  };

  const formatPurity = (purity: number) => {
    if (!purity || isNaN(purity)) return '99.9%';
    const percent = (purity / 10).toFixed(1);
    return `${percent}%`;
  };

  const getMetalColor = (metalType: string) => {
    switch(metalType) {
      case 'GOLD': return 'bg-yellow-100 text-yellow-800';
      case 'SILVER': return 'bg-gray-100 text-gray-800';
      case 'PLATINUM': return 'bg-blue-100 text-blue-800';
      case 'PALLADIUM': return 'bg-purple-100 text-purple-800';
      case 'RHODIUM': return 'bg-red-100 text-red-800';
      case 'COPPER': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetalIcon = (metalType: string) => {
    switch(metalType) {
      case 'GOLD': return '🥇';
      case 'SILVER': return '🥈';
      case 'PLATINUM': return '⚪';
      case 'PALLADIUM': return '🟣';
      case 'RHODIUM': return '🔴';
      case 'COPPER': return '🟠';
      default: return '💎';
    }
  };

  const handlePlaceBid = () => {
    const bids = BidManager.getAuctionBids(auction.title);
    const highestBid = bids[0];
    const minBid = highestBid ? highestBid.amount + 1 : auction.startingPrice;

    const bid = prompt(
      `Bid on "${auction.title}"\n` +
      `Current highest: $${highestBid ? highestBid.amount.toFixed(2) : auction.startingPrice.toFixed(2)}\n` +
      `Minimum bid: $${minBid.toFixed(2)}\n` +
      `Enter your bid amount:`
    );

    if (bid && !isNaN(parseFloat(bid))) {
      const bidAmount = parseFloat(bid);
      if (bidAmount >= minBid) {
        BidManager.saveBid(auction.title, bidAmount);
        alert(`✅ Success! Bid of $${bidAmount.toFixed(2)} placed on "${auction.title}"`);
        // Refresh to show updated bid
        setTimeout(() => window.location.reload(), 500);
      } else {
        alert(`❌ Bid must be at least $${minBid.toFixed(2)}`);
      }
    }
  };

  const handleBuyNow = () => {
    if (!auction.buyNowPrice) return;
    
    const confirmBuy = window.confirm(
      `BUY IT NOW: $${auction.buyNowPrice.toFixed(2)}\n\n` +
      `Item: ${auction.title}\n` +
      `This will immediately purchase the item for $${auction.buyNowPrice.toFixed(2)}.\n\n` +
      `Confirm purchase?`
    );
    
    if (confirmBuy) {
      alert(`✅ PURCHASE CONFIRMED!\n\n` +
        `You bought "${auction.title}" for $${auction.buyNowPrice.toFixed(2)}\n\n` +
        `The seller will contact you for shipping details.`);
    }
  };

  const handleViewDetails = () => {
    const bids = BidManager.getAuctionBids(auction.title);
    const highestBid = bids[0];
    
    alert(`📋 AUCTION DETAILS\n\n` +
      `Title: ${auction.title}\n` +
      `Metal Type: ${auction.metalType}\n` +
      `Weight: ${formatWeight(auction.weight)}\n` +
      `Purity: ${formatPurity(auction.purity)}\n` +
      `Starting Price: $${auction.startingPrice.toFixed(2)}\n` +
      `Current Bid: ${highestBid ? `$${highestBid.amount.toFixed(2)}` : 'No bids yet'}\n` +
      `Buy Now Price: ${auction.buyNowPrice ? `$${auction.buyNowPrice.toFixed(2)}` : 'Not set'}\n` +
      `Total Bids: ${bids.length}\n` +
      `Description: ${auction.description}\n` +
      `End Time: ${formatDate(auction.endTime)}\n` +
      `Created: ${formatDate(auction.createdAt)}`);
  };

  const handleDeleteAuction = () => {
    if (confirm(`Delete auction "${auction.title}"?`)) {
      // Find and remove this auction from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('auction_')) {
          try {
            const storedAuction = JSON.parse(localStorage.getItem(key) || '');
            if (storedAuction.title === auction.title && 
                storedAuction.createdAt === auction.createdAt) {
              localStorage.removeItem(key);
              alert(`Auction "${auction.title}" deleted!`);
              window.location.reload();
              return;
            }
          } catch (e) {
            // ignore errors
          }
        }
      }
      alert("Could not find auction to delete");
    }
  };

  const handleImageClick = (src: string) => {
    setSelectedImage(src);
    setShowImageModal(true);
  };

  const bids = BidManager.getAuctionBids(auction.title);
  const highestBid = bids[0];

  return (
    <>
      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 w-10 h-10 rounded-full"
            onClick={() => setShowImageModal(false)}
          >
            ✕
          </button>
          <img
            src={selectedImage}
            alt="Enlarged view"
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow relative">
        {/* Auction Number Badge */}
        <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
          #{auctionNumber}
        </div>
        
        <div className="p-6">
          {/* Auction Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getMetalIcon(auction.metalType)}</span>
              <div>
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                  {auction.title}
                </h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getMetalColor(auction.metalType)}`}>
                  {auction.metalType}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ${highestBid ? highestBid.amount.toFixed(2) : auction.startingPrice.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                {highestBid ? 'Current bid' : 'Starting bid'}
              </div>
              {auction.buyNowPrice && auction.buyNowPrice > auction.startingPrice && (
                <div className="mt-2">
                  <div className="text-lg font-bold text-green-600">
                    ${auction.buyNowPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-green-500">Buy It Now</div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-2">
            {auction.description}
          </p>

          {/* Bid Info */}
          {bids.length > 0 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-blue-800">
                    Highest bid: ${highestBid.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-blue-600">
                    {bids.length} bid{bids.length !== 1 ? 's' : ''} placed
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-800">By {highestBid.bidder}</div>
                  <div className="text-xs text-blue-600">
                    {new Date(highestBid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Photo Preview */}
          {auction.images && auction.images.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">
                Photos: <span className="font-medium">{auction.images.length}</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {auction.images.slice(0, 3).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleImageClick(img.src)}
                    className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <img
                      src={img.src}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {auction.images.length > 3 && (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                    +{auction.images.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Weight</div>
              <div className="font-semibold">{formatWeight(auction.weight)}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Purity</div>
              <div className="font-semibold">{formatPurity(auction.purity)}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Photos</div>
              <div className="font-semibold">{auction.images?.length || 0}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">Ends</div>
              <div className="font-semibold">{formatDate(auction.endTime)}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            {auction.buyNowPrice && auction.buyNowPrice > auction.startingPrice && (
              <button
                onClick={handleBuyNow}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-bold text-lg"
              >
                🚀 BUY IT NOW: ${auction.buyNowPrice.toFixed(2)}
              </button>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={handlePlaceBid}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Place Bid
              </button>
              <button
                onClick={handleViewDetails}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Details
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
            Listed {formatDate(auction.createdAt)}
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDeleteAuction}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
          >
            🗑️ Delete Auction
          </button>
        </div>
      </div>
    </>
  );
}
