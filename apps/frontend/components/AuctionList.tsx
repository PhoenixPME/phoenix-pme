"use client";

import { useState } from 'react';

interface Auction {
  id: number;
  item: string;
  price: string;
  bids: number;
  timeLeft: string;
  seller: string;
}

export default function AuctionList() {
  const [auctions] = useState<Auction[]>([
    { id: 1, item: '1 oz Gold Bar (999.9 Fine)', price: '$1,950', bids: 3, timeLeft: '2 days', seller: 'GoldDealer123' },
    { id: 2, item: '10 oz Silver Bar (.999 Fine)', price: '$285', bids: 5, timeLeft: '1 day', seller: 'SilverStacker' },
    { id: 3, item: '1 oz Platinum Coin (Maple Leaf)', price: '$1,050', bids: 1, timeLeft: '5 days', seller: 'PlatinumTrust' },
    { id: 4, item: '1 oz Palladium Bar', price: '$1,350', bids: 0, timeLeft: '7 days', seller: 'MetalsDirect' },
  ]);

  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">🪙 Active Precious Metals Auctions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {auctions.map((auction) => (
          <div 
            key={auction.id} 
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setSelectedAuction(auction)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{auction.item}</h3>
                <p className="text-sm text-gray-600">Seller: {auction.seller}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                {auction.bids} bid{auction.bids !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{auction.price}</p>
                  <p className="text-sm text-gray-500">Current bid</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Ends in</p>
                  <p className="font-semibold text-gray-900">{auction.timeLeft}</p>
                </div>
              </div>
              
              <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
                Place Bid
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{selectedAuction.item}</h3>
            <p>Price: {selectedAuction.price}</p>
            <p>Bids: {selectedAuction.bids}</p>
            <p>Time left: {selectedAuction.timeLeft}</p>
            <p>Seller: {selectedAuction.seller}</p>
            <button 
              onClick={() => setSelectedAuction(null)}
              className="mt-4 w-full bg-gray-500 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
