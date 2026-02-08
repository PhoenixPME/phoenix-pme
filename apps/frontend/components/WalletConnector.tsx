'use client';

import { useEffect, useState } from 'react';

export default function WalletConnector() {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('wallet_connection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const { address, timestamp } = parsed || {};
        
        // Check if saved within last 24 hours
        if (address && timestamp && Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setConnectedAddress(address);
        }
      } catch {
        // Clear corrupted data
        localStorage.removeItem('wallet_connection');
      }
    }
  }, []);

  const connectWallet = () => {
    // Simulate wallet connection
    const mockAddress = 'core1...' + Math.random().toString(36).substring(7);
    const connectionData = {
      address: mockAddress,
      timestamp: Date.now(),
    };
    
    localStorage.setItem('wallet_connection', JSON.stringify(connectionData));
    setConnectedAddress(mockAddress);
    
    alert(`Connected to wallet: ${mockAddress}`);
  };

  const disconnectWallet = () => {
    localStorage.removeItem('wallet_connection');
    setConnectedAddress(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="font-medium text-gray-900 mb-2">Wallet Connection</h3>
      
      {connectedAddress ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600">✅ Connected</span>
            <button
              onClick={disconnectWallet}
              className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
            >
              Disconnect
            </button>
          </div>
          <div className="text-xs font-mono bg-gray-50 p-2 rounded truncate">
            {connectedAddress}
          </div>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
