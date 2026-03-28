'use client';

import { useState } from 'react';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  isOpen?: boolean;
  types?: string[];
}

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const searchRestaurants = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }
      
      setRestaurants(data.restaurants || []);
    } catch (err: any) {
      setError(err.message);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchRestaurants(searchTerm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            🍴 Tacoma Eats
          </h1>
          <p className="text-xl text-white/80">
            Your guide to dining in Tacoma/Pierce County
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search restaurants, cuisine, dish..."
              className="flex-1 px-6 py-4 rounded-lg bg-white/10 backdrop-blur-md text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white font-semibold rounded-lg transition"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400 mb-4"></div>
            <p className="text-xl text-white">Finding delicious options...</p>
          </div>
        )}

        {/* Results */}
        {!loading && restaurants.length > 0 && (
          <div>
            <p className="text-white/70 mb-4">
              Found {restaurants.length} {restaurants.length === 1 ? 'restaurant' : 'restaurants'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/15 transition"
                >
                  <h3 className="text-xl font-bold text-white mb-2">
                    {restaurant.name}
                  </h3>
                  <p className="text-white/70 mb-3">{restaurant.address}</p>
                  
                  {restaurant.rating && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-white font-semibold">
                        {restaurant.rating.toFixed(1)}
                      </span>
                      {restaurant.userRatingsTotal && (
                        <span className="text-white/50 text-sm">
                          ({restaurant.userRatingsTotal} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  {restaurant.priceLevel && (
                    <div className="text-white/70 mb-2">
                      {'$'.repeat(restaurant.priceLevel)}
                    </div>
                  )}

                  {restaurant.isOpen !== undefined && (
                    <div className={`text-sm font-semibold ${restaurant.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                      {restaurant.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && restaurants.length === 0 && searchTerm && !error && (
          <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No restaurants found</h3>
            <p className="text-white/70">Try a different search term</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && restaurants.length === 0 && !searchTerm && (
          <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
            <div className="text-6xl mb-4">🍕🍔🍣</div>
            <h3 className="text-2xl font-bold text-white mb-2">Start Your Search</h3>
            <p className="text-white/70">Search for restaurants, cuisines, or dishes in Tacoma</p>
          </div>
        )}
      </div>
    </div>
  );
}
