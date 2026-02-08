'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        // Save token to localStorage
        localStorage.setItem('auth_token', 'jwt-token-' + Date.now());
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_name', email.split('@')[0]);
        
        alert('✅ Login successful!');
        router.push('/create-auction');
      } else {
        setError('Please enter email and password');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏛️</div>
            <h1 className="text-3xl font-bold text-gray-900">PhoenixPME</h1>
            <p className="text-gray-600 mt-2">Precious Metals Exchange</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="trader@phoenixpme.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Logging in...' : 'Login to PhoenixPME'}
            </button>

            <div className="text-center text-sm text-gray-600">
              <p>Test credentials: trader@phoenixpme.com / password123</p>
            </div>
          </form>

          {/* Demo Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Demo Features:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Create precious metals auctions</li>
              <li>• Upload photos of your items</li>
              <li>• Set starting prices and end times</li>
              <li>• Browse all active auctions</li>
              <li>• Place bids on auctions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
