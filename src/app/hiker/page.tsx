"use client"

import { useState } from "react";
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mountain, 
  MapPin, 
  Store, 
  Award, 
  Star, 
  Navigation,
  Trophy
} from "lucide-react";

// Dynamically import MapboxMap to avoid SSR issues
const MapboxMap = dynamic(() => import('@/components/MapboxMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <Navigation className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-2 animate-pulse" />
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Loading Map...</p>
      </div>
    </div>
  )
});

const caminoFrancesPoints: { name: string; coords: [number, number] }[] = [
  { name: "Saint-Jean-Pied-de-Port", coords: [ -1.2376, 43.1631 ] },
  { name: "Roncesvalles", coords: [ -1.3167, 43.0094 ] },
  { name: "Pamplona", coords: [ -1.6461, 42.8185 ] },
  { name: "Logroño", coords: [ -2.4456, 42.4667 ] },
  { name: "Burgos", coords: [ -3.7003, 42.3439 ] },
  { name: "León", coords: [ -5.5660, 42.5987 ] },
  { name: "Astorga", coords: [ -6.0527, 42.4570 ] },
  { name: "Ponferrada", coords: [ -6.5911, 42.5461 ] },
  { name: "Sarria", coords: [ -7.4156, 42.7797 ] },
  { name: "Santiago de Compostela", coords: [ -8.5448, 42.8806 ] }
];

// Mock data for shops near you
const mockShops = [
  {
    id: 1,
    name: "Mountain Gear Co.",
    type: "Outdoor Equipment",
    distance: "0.3 miles",
    rating: 4.8,
    price: "$$",
    image: "🏪",
    phone: "(555) 123-4567",
    address: "123 Trail St, Adventure City"
  },
  {
    id: 2,
    name: "Trail Runner's Paradise",
    type: "Running & Hiking",
    distance: "0.5 miles",
    rating: 4.9,
    price: "$$$",
    image: "🏃‍♂️",
    phone: "(555) 234-5678",
    address: "456 Summit Ave, Adventure City"
  },
  {
    id: 3,
    name: "Basecamp Cafe",
    type: "Food & Coffee",
    distance: "0.7 miles",
    rating: 4.6,
    price: "$",
    image: "☕",
    phone: "(555) 345-6789",
    address: "789 Peak Blvd, Adventure City"
  },
  {
    id: 4,
    name: "Alpine Sports Rental",
    type: "Equipment Rental",
    distance: "1.2 miles",
    rating: 4.7,
    price: "$$",
    image: "⛷️",
    phone: "(555) 456-7890",
    address: "321 Ridge Road, Adventure City"
  }
];

// Mock data for badges/NFTs
const mockBadges = [
  {
    id: 1,
    name: "First Steps",
    description: "Completed your first hike",
    rarity: "Common",
    earned: true,
    icon: "🥾",
    color: "bg-gray-600"
  },
  {
    id: 2,
    name: "Peak Conqueror",
    description: "Reached 10 mountain summits",
    rarity: "Rare",
    earned: true,
    icon: "⛰️",
    color: "bg-gray-700"
  },
  {
    id: 3,
    name: "Trail Blazer",
    description: "Discovered 5 new trails",
    rarity: "Epic",
    earned: true,
    icon: "🧭",
    color: "bg-gray-800"
  },
  {
    id: 4,
    name: "Early Bird",
    description: "Started 20 hikes before sunrise",
    rarity: "Rare",
    earned: true,
    icon: "🌅",
    color: "bg-gray-700"
  },
  {
    id: 5,
    name: "Community Leader",
    description: "Led 50 group hikes",
    rarity: "Legendary",
    earned: true,
    icon: "👥",
    color: "bg-gray-900"
  },
  {
    id: 6,
    name: "Weather Warrior",
    description: "Hiked in all weather conditions",
    rarity: "Epic",
    earned: false,
    icon: "⛈️",
    color: "bg-gray-400"
  },
  {
    id: 7,
    name: "Distance Demon",
    description: "Hiked 1000+ miles total",
    rarity: "Legendary",
    earned: false,
    icon: "🏃‍♂️",
    color: "bg-gray-400"
  },
  {
    id: 8,
    name: "Photo Pro",
    description: "Shared 100 trail photos",
    rarity: "Rare",
    earned: true,
    icon: "📸",
    color: "bg-gray-700"
  },
  {
    id: 9,
    name: "Night Owl",
    description: "Completed 10 night hikes",
    rarity: "Epic",
    earned: false,
    icon: "🦉",
    color: "bg-gray-400"
  }
];

export default function HikerPage() {
  const [activeTab, setActiveTab] = useState<"map" | "badges">("map");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-gray-700 dark:text-gray-300" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Framino</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-gray-600 border-gray-300">
                Connected: 0x1234...5678
              </Badge>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                Profile
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("map")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === "map"
                  ? "border-gray-900 text-gray-900 dark:border-gray-300 dark:text-gray-100"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MapPin className="h-4 w-4 inline mr-2" />
              Map & Shops
            </button>
            <button
              onClick={() => setActiveTab("badges")}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === "badges"
                  ? "border-gray-900 text-gray-900 dark:border-gray-300 dark:text-gray-100"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Award className="h-4 w-4 inline mr-2" />
              Badge Gallery
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "map" ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Map Section - Left on desktop, Top on mobile */}
            <div className="flex-1 lg:w-1/2">
              <Card className="p-6 h-full border border-gray-200 shadow-sm bg-white dark:bg-gray-900">
                <CardHeader className="">
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-600" />
                    Trail Map
                  </CardTitle>
                  <CardDescription>
                    Interactive map showing trails and nearby shops
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[420px] lg:h-full">
                  {/* Real Mapbox Map */}
                  <MapboxMap 
                    accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.demo_token'}
                    initialViewState={{
                      longitude: -8.5448, // Camino de Santiago (Santiago de Compostela)
                      latitude: 42.5806,
                      zoom: 7,
                      pitch: 40, // tilt for 3D
                      bearing: -50 // slight rotation for effect
                    }}
                    style="mapbox://styles/mapbox/outdoors-v12"
                    className="w-full h-full rounded-lg"
                    points={caminoFrancesPoints}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Shops Section - Right on desktop, Bottom on mobile */}
            <div className="flex-1 lg:w-1/2">
              <Card className="p-6 h-full border border-gray-200 shadow-sm bg-white dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="h-5 w-5 mr-2 text-gray-600" />
                    Shops Near You
                  </CardTitle>
                  <CardDescription>
                    Outdoor gear shops and services in your area
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-y-auto">
                  <div className="grid gap-4">
                    {mockShops.map((shop) => (
                      <Card key={shop.id} className="p-4 border border-gray-200 dark:border-gray-700">
                        <CardContent className="">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {shop.image} {shop.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {shop.type}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {shop.address}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-gray-600 mr-1" />
                                    <span className="text-sm font-medium">{shop.rating}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 text-gray-600 mr-1" />
                                    <span className="text-sm">{shop.distance}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col lg:flex-row gap-2">
                              {/* <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                <Phone className="h-4 w-4 mr-1" />
                                Call
                              </Button> */}
                              <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white text-xs">
                                <Navigation className="h-4 w-4 mr-1" />
                                Directions
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Badge Gallery Tab */
          <div>
            <Card className="border border-gray-200 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-gray-600" />
                  Badge Gallery
                </CardTitle>
                <CardDescription>
                  Your hiking achievements and NFT badges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockBadges.map((badge) => (
                    <Card 
                      key={badge.id} 
                      className={`border transition-all duration-200 hover:scale-105 ${
                        badge.earned 
                          ? "border-gray-300 dark:border-gray-600 shadow-sm" 
                          : "border-gray-200 dark:border-gray-700 opacity-60"
                      }`}
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 rounded-full ${badge.color} flex items-center justify-center mx-auto mb-4 text-2xl text-white`}>
                          {badge.earned ? badge.icon : "🔒"}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {badge.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {badge.description}
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className={`${
                              badge.rarity === "Legendary" ? "bg-gray-800 text-white" :
                              badge.rarity === "Epic" ? "bg-gray-700 text-white" :
                              badge.rarity === "Rare" ? "bg-gray-600 text-white" :
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {badge.rarity}
                          </Badge>
                          {badge.earned && (
                            <Badge variant="outline" className="text-gray-600 border-gray-400">
                              ✓ Earned
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
