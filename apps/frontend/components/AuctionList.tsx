// components/AuctionList.tsx - UPDATED
"use client";

import { useState, useEffect } from "react";
import { AuctionClient } from "@/lib/contracts/auction-client";

export function AuctionList() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    try {
      const client = new AuctionClient();
      const auctionList = await client.listAuctions();
      console.log("Loaded auctions:", auctionList);
      setAuctions(auctionList || []);
    } catch (error) {
      console.error("Error loading auctions:", error);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (e) {
      return "Invalid date";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Ended': return 'bg-yellow-100 text-yellow-800';
      case 'Disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-4">Loading auctions...</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Your Auctions ({auctions.length})</h3>
      
      {auctions.length === 0 ? (
        <div className="text-center p-8 text-gray-500 border rounded-lg">
          No auctions found. Create your first auction above!
        </div>
      ) : (
        <div className="space-y-3">
          {auctions.map((auction) => (
            <div key={auction.id} className="p-4 border rounded-lg bg-white hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{auction.item_description}</h4>
                  <p className="text-sm text-gray-600 mt-1">ID: {auction.id}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-lg text-blue-600">{auction.starting_price} TEST</p>
                  <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(auction.status)}`}>
                    {auction.status || 'Active'}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t text-sm text-gray-500 flex justify-between">
                <div>
                  <p className="font-medium">Ends: {formatTime(auction.end_time)}</p>
                </div>
                <div>
                  <p className="font-medium">Created: {formatTime(auction.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-center">
        <button
          onClick={loadAuctions}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          🔄 Refresh List
        </button>
      </div>
    </div>
  );
}
