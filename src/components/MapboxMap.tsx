/* eslint-disable @typescript-eslint/no-explicit-any */
// MapboxMap.tsx

"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapboxMapProps {
  accessToken: string;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
  };
  style?: string;
  className?: string;
  points?: { name: string; coords: [number, number] }[];
}

const MapboxMap = ({
  accessToken,
  initialViewState = {
    longitude: -8.5448, // Camino de Santiago (Santiago de Compostela)
    latitude: 42.8806,
    zoom: 12,
    pitch: 60, // tilt for 3D
    bearing: -20, // slight rotation for effect
  },
  style = "mapbox://styles/mapbox/outdoors-v12",
  className = "w-full h-full",
  points = [],
}: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (
      !accessToken ||
      accessToken === "pk.demo_token" ||
      accessToken.includes("your_mapbox_access_token_here")
    ) {
      return;
    }

    mapboxgl.accessToken = accessToken;

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: style,
        center: [initialViewState.longitude, initialViewState.latitude],
        zoom: initialViewState.zoom,
        pitch: initialViewState.pitch || 0,
        bearing: initialViewState.bearing || 0,
        antialias: true,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        // Enable 3D terrain
        map.current!.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.terrain-rgb",
          tileSize: 512,
          maxzoom: 14,
        });
        map.current!.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

        // Add 3D buildings
        const layers = map.current!.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer) =>
            layer.type === "symbol" &&
            layer.layout &&
            (layer.layout as any)["text-field"]
        )?.id;

        map.current!.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "height"],
              ],
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "min_height"],
              ],
              "fill-extrusion-opacity": 0.6,
            },
          },
          labelLayerId
        );
      });
    }

    if (map.current && points.length > 0) {
      // Remove existing markers if needed (optional, for updates)
      (map.current as any)._markers?.forEach((m: mapboxgl.Marker) =>
        m.remove()
      );
      (map.current as any)._markers = [];

      points.forEach((point) => {
        const marker = new mapboxgl.Marker()
          .setLngLat(point.coords)
          .setPopup(new mapboxgl.Popup().setText(point.name))
          .addTo(map.current!);

        (map.current as any)._markers.push(marker);
      });
    }
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [points, accessToken, initialViewState, style]);

  if (
    !accessToken ||
    accessToken === "pk.demo_token" ||
    accessToken.includes("your_mapbox_access_token_here")
  ) {
    return (
      <div
        className={`${className} bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700`}
      >
        <div className="text-center p-8">
          <div className="mb-4">🗺</div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Mapbox Integration Ready
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Add your Mapbox access token to see the interactive map
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} />;
};

export default MapboxMap;
