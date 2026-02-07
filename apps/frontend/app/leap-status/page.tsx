'use client';

import { useEffect, useState } from 'react';

// Extend Window interface
declare global {
  interface Window {
    leap?: any;
  }
}

export default function LeapStatusPage() {
  const [leapInstalled, setLeapInstalled] = useState(false);

  useEffect(() => {
    // Check if leap exists on window object
    const isLeapInstalled = typeof window !== 'undefined' && window.leap;
    setLeapInstalled(!!isLeapInstalled);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Leap Wallet Status</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${leapInstalled ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-lg font-medium">
              {leapInstalled ? 'Leap Wallet is installed' : 'Leap Wallet is not detected'}
            </span>
          </div>
          
          <div className="mt-6 space-y-4">
            <p className="text-gray-600">
              {leapInstalled 
                ? 'Your Leap wallet is ready to use with PhoenixPME.'
                : 'Please install Leap wallet to interact with the Cosmos ecosystem.'}
            </p>
            
            {!leapInstalled && (
              <a
                href="https://www.leapwallet.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Install Leap Wallet
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
