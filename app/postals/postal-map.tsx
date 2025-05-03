"use client";

import { useEffect, useRef, useState } from "react";
import { calculateArea } from "./utils";

interface PostalMapProps {
  onPointsChange: (points: [number, number][]) => void;
  onAreaChange: (area: number) => void;
  points: [number, number][];
  onReset?: () => void;
}

export function PostalMap({
  onPointsChange,
  onAreaChange,
  points,
  onReset,
}: PostalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polygonRef = useRef<any>(null);

  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Initialize the map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isMapInitialized) {
      return;
    }

    // Check if Leaflet is already loaded
    if (window.L) {
      initializeMap();
      return;
    }

    // Check if Leaflet script is already being loaded
    const existingScript = document.querySelector('script[src*="leaflet"]');
    if (existingScript) {
      existingScript.addEventListener("load", initializeMap);
      return;
    }

    // Load Leaflet script dynamically
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = initializeMap;
    document.head.appendChild(script);

    // Check if Leaflet CSS is already loaded
    const existingLink = document.querySelector('link[href*="leaflet"]');
    if (!existingLink) {
      // Load Leaflet CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    return () => {
      // Clean up map instance when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapInitialized]);

  // Update polygon when points change
  useEffect(() => {
    if (!isMapInitialized || !mapInstanceRef.current) return;

    updatePolygon();
  }, [points, isMapInitialized]);

  // Initialize the map
  const initializeMap = () => {
    try {
      const L = window.L;

      // Check if the map container already has a Leaflet instance
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        console.log(
          "Map container already has a Leaflet instance, cleaning up..."
        );
        // Clean up existing instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        // Reset the _leaflet_id property
        delete (mapRef.current as any)._leaflet_id;
      }

      // Create map instance with default coordinates for Encarnación, Paraguay
      const map = L.map(mapRef.current).setView([-27.3364, -55.8675], 14);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add click handler to add markers
      map.on("click", handleMapClick);

      setIsMapInitialized(true);
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  // Handle map click to add markers
  const handleMapClick = (e: any) => {
    const L = window.L;
    const { lat, lng } = e.latlng;

    // Create a new marker
    const marker = L.marker([lat, lng], {
      draggable: true,
    }).addTo(mapInstanceRef.current);

    // Add popup with remove button
    marker.bindPopup(`
      <div>
        <p>Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}</p>
        <button class="remove-marker" style="background-color: #ef4444; color: white; padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer; margin-top: 4px;">
          Eliminar punto
        </button>
      </div>
    `);

    // Add event listener to remove button
    marker.on("popupopen", () => {
      setTimeout(() => {
        const removeButton = document.querySelector(".remove-marker");
        if (removeButton) {
          removeButton.addEventListener("click", () => {
            mapInstanceRef.current.removeLayer(marker);
            updateMarkers();
          });
        }
      }, 0);
    });

    // Update marker position on drag
    marker.on("dragend", updateMarkers);

    // Add marker to refs array
    markersRef.current.push(marker);

    // Update markers array and polygon
    updateMarkers();
  };

  // Update markers array and polygon
  const updateMarkers = () => {
    // Filter out any removed markers
    markersRef.current = markersRef.current.filter(
      (marker) => marker && marker._map !== null
    );

    const newPoints: [number, number][] = markersRef.current.map((marker) => {
      const position = marker.getLatLng();
      return [position.lat, position.lng];
    });

    onPointsChange(newPoints);
  };

  // Update polygon on the map
  const updatePolygon = () => {
    const L = window.L;

    // Remove existing polygon
    if (polygonRef.current) {
      mapInstanceRef.current.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }

    // Create new polygon if we have at least 3 points
    if (points.length >= 3) {
      const polygonPoints = points.map(([lat, lng]) => [lat, lng]);

      // Create polygon
      polygonRef.current = L.polygon(polygonPoints, {
        color: "blue",
        fillOpacity: 0.2,
      }).addTo(mapInstanceRef.current);

      // Calculate area
      const area = calculateArea(points);
      onAreaChange(area);
    } else {
      onAreaChange(0);
    }
  };

  // Reset all markers and polygon
  const resetMap = () => {
    if (!mapInstanceRef.current) return;

    // Remove all markers
    markersRef.current.forEach((marker) => {
      if (marker && marker._map) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });

    // Clear markers array
    markersRef.current = [];

    // Remove polygon
    if (polygonRef.current) {
      mapInstanceRef.current.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }

    // Update points
    onPointsChange([]);
    onAreaChange(0);

    // Call onReset if provided
    if (onReset) {
      onReset();
    }
  };

  // Add effect to handle reset from parent
  useEffect(() => {
    if (points.length === 0 && markersRef.current.length > 0) {
      resetMap();
    }
  }, [points]);

  return <div ref={mapRef} className="h-full w-full relative z-0" />;
}
