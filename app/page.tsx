'use client';

import { useState, useEffect } from 'react';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  isOpen?: boolean;
  types?: string[];
  lat?: number;
  lng?: number;
}

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<number | null>(null);

  useEffect(() => {
    loadAllRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, searchTerm, showOpenOnly, priceFilter]);

  const loadAllRestaurants = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/restaurants');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load restaurants');
      }
      
      setRestaurants(data.restaurants || []);
    } catch (err: any) {
      setError(err.message);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = [...restaurants];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(term) ||
        r.address.toLowerCase().includes(term) ||
        r.types?.some(t => t.toLowerCase().includes(term))
      );
    }

    // Open now filter
    if (showOpenOnly) {
      filtered = filtered.filter(r => r.isOpen === true);
    }

    // Price filter
    if (priceFilter !== null) {
      filtered = filtered.filter(r => r.priceLevel === priceFilter);
    }

    setFilteredRestaurants(filtered);
  };

  const stats = {
    total: restaurants.length,
    openNow: restaurants.filter(r => r.isOpen).length,
    highRated: restaurants.filter(r => (r.rating || 0) >= 4.5).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            🍴 Tacoma Eats
          </h1>
          <p className="text-xl text-white/80 mb-6">
            Your guide to dining in Tacoma/Pierce County
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-white/70">Restaurants</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold text-green-400">{stats.openNow}</div>
              <div className="text-sm text-white/70">Open Now</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 col-span-2 md:col-span-1">
              <div className="text-3xl font-bold text-yellow-400">{stats.highRated}</div>
              <div className="text-sm text-white/70">Highly Rated (4.5+)</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search restaurants, cuisine, dish..."
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Open Now Toggle */}
            <label className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 border border-white/20 cursor-pointer hover:bg-white/15 transition">
              <input
                type="checkbox"
                checked={showOpenOnly}
                onChange={(e) => setShowOpenOnly(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-white font-semibold">Open Now</span>
            </label>

            {/* Price Filter */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((price) => (
                <button
                  key={price}
                  onClick={() => setPriceFilter(priceFilter === price ? null : price)}
                  className={`px-4 py-3 rounded-lg font-semibold transition ${
                    priceFilter === price
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/15 border border-white/20'
                  }`}
                >
                  {'$'.repeat(price)}
                </button>
              ))}
            </div>
          </div>
        </div>

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
            <p className="text-xl text-white">Loading Tacoma restaurants...</p>
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredRestaurants.length > 0 && (
          <p className="text-white/70 mb-4">
            Showing {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'}
          </p>
        )}

        {/* Restaurant Grid */}
        {!loading && filteredRestaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-white flex-1">
                    {restaurant.name}
                  </h3>
                  {restaurant.isOpen !== undefined && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      restaurant.isOpen 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {restaurant.isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  )}
                </div>

                <p className="text-white/60 text-sm mb-4 line-clamp-2">{restaurant.address}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {restaurant.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-lg">⭐</span>
                        <span className="text-white font-bold">{restaurant.rating.toFixed(1)}</span>
                        {restaurant.userRatingsTotal && (
                          <span className="text-white/40 text-xs">
                            ({restaurant.userRatingsTotal})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {restaurant.priceLevel && (
                    <div className="text-green-400 font-bold">
                      {'$'.repeat(restaurant.priceLevel)}
                    </div>
                  )}
                </div>

                {/* Cuisine Types */}
                {restaurant.types && restaurant.types.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {restaurant.types
                      .filter(t => !t.includes('point_of_interest') && !t.includes('establishment'))
                      .slice(0, 3)
                      .map((type, idx) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-1 rounded bg-white/10 text-white/60"
                        >
                          {type.replace(/_/g, ' ')}
                        </span>
                      ))
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredRestaurants.length === 0 && !error && (
          <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No restaurants found</h3>
            <p className="text-white/70">Try adjusting your filters or search</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-white/50 text-sm">
          <p>Built for the 253 🌮🍕🍣🍔</p>
          <p className="mt-1">Powered by Google Places API</p>
        </div>
      </div>
    </div>
  );
}
