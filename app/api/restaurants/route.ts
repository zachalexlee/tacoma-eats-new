import { NextResponse } from 'next/server';

interface Place {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now?: boolean;
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    // Tacoma center coordinates
    const location = '47.2529,-122.4443';
    const radius = 25000; // 25km to cover Pierce County
    
    // Multiple searches to get more restaurants
    const queries = [
      'restaurant',
      'bar',
      'cafe',
      'brewery',
      'pizza',
      'sushi',
      'thai',
      'mexican',
      'italian',
      'chinese',
      'burger'
    ];

    const allPlaces: Place[] = [];
    const seenIds = new Set<string>();

    for (const query of queries) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&keyword=${query}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results) {
        for (const place of data.results) {
          if (!seenIds.has(place.place_id)) {
            seenIds.add(place.place_id);
            allPlaces.push(place);
          }
        }
      }
    }

    // Transform to our format
    const restaurants = allPlaces.map((place) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      priceLevel: place.price_level,
      isOpen: place.opening_hours?.open_now,
      types: place.types,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    }));

    // Sort by rating (highest first)
    restaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return NextResponse.json({ 
      restaurants: restaurants.slice(0, 100), // Limit to top 100
      total: restaurants.length 
    });
  } catch (error: any) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}
