'use client';

import { useEffect, useState } from 'react';
import AuctionCard from '@/components/auctions/AuctionCard';

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

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = () => {
    const loadedAuctions: Auction[] = [];
    
    // Load all auctions from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('auction_') || key === 'last_auction' || key === 'auction_draft')) {
        try {
          const auction = JSON.parse(localStorage.getItem(key) || '');
          if (auction && auction.title) {
            loadedAuctions.push(auction);
          }
        } catch (e) {
          console.error('Error parsing auction:', e);
        }
      }
    }
    
    // Remove duplicates (keep most recent)
    const uniqueAuctions = loadedAuctions.reverse().filter((auction, index, self) =>
      index === self.findIndex((a) => a.title === auction.title && a.createdAt === auction.createdAt)
    );
    
    setAuctions(uniqueAuctions);
    setLoading(false);
  };

  const clearAllAuctions = () => {
    if (confirm("Are you sure you want to delete ALL auctions?")) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('auction_')) {
          localStorage.removeItem(key);
        }
      }
      localStorage.removeItem('auction_draft');
      localStorage.removeItem('last_auction');
      loadAuctions();
      alert("All auctions cleared!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900">Loading auctions...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Live Auctions</h1>
          <p className="text-gray-600 mt-2">Browse precious metals for sale</p>
        </div>

        {auctions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-6">🏛️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No auctions yet</h2>
            <p className="text-gray-600 mb-8">Create your first auction to start trading</p>
            <a
              href="/create-auction"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 text-lg font-medium"
            >
              Create First Auction
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {auctions.length} Auction{auctions.length !== 1 ? 's' : ''} Available
                </h2>
                <p className="text-gray-600">Sorted by newest first</p>
              </div>
              <div className="flex gap-2">
                <a
                  href="/create-auction"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + New Auction
                </a>
                <button
                  onClick={clearAllAuctions}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction, index) => (
                <AuctionCard
                  key={index}
                  auction={auction}
                  auctionNumber={index + 1}
                />
              ))}
            </div>

            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Market Overview</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">{auctions.length}</div>
                  <div className="text-sm text-gray-600">Total Auctions</div>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">
                    ${auctions.reduce((sum, a) => sum + a.startingPrice, 0).toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">
                    {Array.from(new Set(auctions.map(a => a.metalType))).length}
                  </div>
                  <div className="text-sm text-gray-600">Metal Types</div>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">
                    {auctions.filter(a => new Date(a.endTime) > new Date()).length}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
