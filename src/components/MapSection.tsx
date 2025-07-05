"use client";

import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin,
  Map,
  Store, 
  Star, 
  Navigation
} from "lucide-react";

// Dynamically import MapboxMap to avoid SSR issues
const MapboxMap = dynamic(() => import("@/components/MapboxMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <Navigation className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-2 animate-pulse" />
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Loading Map...
        </p>
      </div>
    </div>
  ),
});

const caminoFrancesPoints: { name: string; coords: [number, number] }[] = [
  { name: "Saint-Jean-Pied-de-Port", coords: [-1.2376, 43.1631] },
  { name: "Roncesvalles", coords: [-1.3167, 43.0094] },
  { name: "Pamplona", coords: [-1.6461, 42.8185] },
  { name: "Logroño", coords: [-2.4456, 42.4667] },
  { name: "Burgos", coords: [-3.7003, 42.3439] },
  { name: "León", coords: [-5.566, 42.5987] },
  { name: "Astorga", coords: [-6.0527, 42.457] },
  { name: "Ponferrada", coords: [-6.5911, 42.5461] },
  { name: "Sarria", coords: [-7.4156, 42.7797] },
  { name: "Santiago de Compostela", coords: [-8.5448, 42.8806] },
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
    address: "123 Trail St, Adventure City",
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
    address: "456 Summit Ave, Adventure City",
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
    address: "789 Peak Blvd, Adventure City",
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
    address: "321 Ridge Road, Adventure City",
  },
];

export default function MapSection() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Map Section - Left on desktop, Top on mobile */}
      <div className="flex-1 lg:w-1/2">
        <Card className="p-6 h-full border border-gray-200 shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700">
          <CardHeader className="">
            <CardTitle className="flex items-center">
              <Map className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-200" />
              Trail Map
            </CardTitle>
            <CardDescription>
              Interactive map showing trails and nearby shops
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[420px] lg:h-full">
            {/* Real Mapbox Map */}
            <MapboxMap
              accessToken={
                process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
                "pk.demo_token"
              }
              initialViewState={{
                longitude: -8.5448, // Camino de Santiago (Santiago de Compostela)
                latitude: 42.5806,
                zoom: 7,
                pitch: 40, // tilt for 3D
                bearing: -50, // slight rotation for effect
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
        <Card className="p-6 h-full border border-gray-200 shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-200" />
              Shops Near You
            </CardTitle>
            <CardDescription>
              Outdoor gear shops and services in your area
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto">
            <div className="grid gap-4">
              {mockShops.map((shop) => (
                <Card
                  key={shop.id}
                  className="p-4 border border-gray-200 dark:border-gray-700"
                >
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
                              <Star className="h-4 w-4 text-gray-600 mr-1 dark:text-gray-300" />
                              <span className="text-sm font-medium">
                                {shop.rating}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-600 mr-1 dark:text-gray-300" />
                              <span className="text-sm">
                                {shop.distance}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col lg:flex-row gap-2">
                        <Button
                          size="sm"
                          className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 text-xs cursor-pointer"
                        >
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
  );
}
