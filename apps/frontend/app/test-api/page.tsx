'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await fetch('http://localhost:3001/api/auctions');
      const data = await response.json();
      if (data.success) {
        setResult(`✅ SUCCESS! Backend connected. Found ${data.data.auctions.length} auctions including ${data.data.auctions.filter((a: any) => a.metalType === 'PALLADIUM').length} palladium auctions.`);
      } else {
        setResult(`❌ API Error: ${data.error}`);
      }
    } catch (error: any) {
      setResult(`❌ Connection Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Backend Connection Test</h1>
        <p className="text-gray-600 mb-6">
          Testing connection to PhoenixPME Backend at <code>http://localhost:3001</code>
        </p>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing Connection...' : 'Test Backend Connection'}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${result.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className="font-semibold mb-2">Result:</h3>
            <p className={result.includes('✅') ? 'text-green-800' : 'text-red-800'}>{result}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold mb-3">Backend Status:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Backend Port: 3001</li>
            <li>• Frontend Port: 3000</li>
            <li>• Database: PostgreSQL</li>
            <li>• Metal Types: GOLD, SILVER, PLATINUM, PALLADIUM, RHODIUM, COPPER</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
