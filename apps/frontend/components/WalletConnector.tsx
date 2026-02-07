'use client';

import { useState, useEffect } from 'react';

// Extend Window interface to include leap
declare global {
  interface Window {
    leap?: any;
  }
}

export default function WalletConnector() {
  const [leapAvailable, setLeapAvailable] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if Leap wallet is available
    setLeapAvailable(!!window.leap);

    // Check for saved address
    const saved = localStorage.getItem('phoenix_wallet');
    if (saved) {
      try {
        const { address, timestamp } = JSON.parse(saved);
        // Check if saved within last 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setConnectedAddress(address);
        }
      } catch (e) {
        console.error('Failed to parse saved wallet:', e);
      }
    }
  }, []);

  const connectLeap = async () => {
    if (!window.leap) {
      alert('Leap wallet not detected. Please install Leap wallet first.');
      window.open('https://www.leapwallet.io/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      // Request connection
      await window.leap.enable('phoenix-pme');
      
      // Get accounts
      const accounts = await window.leap.getKey();
      const address = accounts?.address;
      
      if (address) {
        setConnectedAddress(address);
        // Save to localStorage
        localStorage.setItem('phoenix_wallet', JSON.stringify({
          address,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Failed to connect Leap wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setConnectedAddress(null);
    localStorage.removeItem('phoenix_wallet');
  };

  return (
    <div className="wallet-connector">
      {connectedAddress ? (
        <div className="flex items-center space-x-3">
          <div className="text-sm">
            <div className="font-medium">Connected</div>
            <div className="text-gray-500 text-xs truncate max-w-[120px]">
              {connectedAddress.slice(0, 10)}...{connectedAddress.slice(-8)}
            </div>
          </div>
          <button
            onClick={disconnect}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectLeap}
          disabled={isConnecting || !leapAvailable}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all
            ${leapAvailable
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      
      {!leapAvailable && (
        <div className="mt-2 text-xs text-gray-500">
          Install <a href="https://www.leapwallet.io/" className="text-blue-500" target="_blank">Leap Wallet</a>
        </div>
      )}
    </div>
  );
}
