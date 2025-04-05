"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface ReportMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
}

export function ReportMap({
  onLocationSelect,
  selectedLocation,
}: ReportMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize map after Leaflet script is loaded
  const initializeMap = () => {
    if (!mapRef.current || !window.L || isMapInitialized) return;

    try {
      const L = window.L;

      // Create map instance with default coordinates for Encarnación, Paraguay
      const map = L.map(mapRef.current).setView([-27.3364, -55.8675], 14);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Handle map click to set marker
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);
      });

      // Add initial marker if selectedLocation exists
      if (selectedLocation) {
        markerRef.current = L.marker(
          [selectedLocation.lat, selectedLocation.lng],
          {
            draggable: true,
          }
        ).addTo(map);

        // Handle marker drag end
        markerRef.current.on("dragend", function (e: any) {
          const position = e.target.getLatLng();
          onLocationSelect(position.lat, position.lng);
        });
      }

      setIsMapInitialized(true);
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  // Handle script load event
  const handleScriptLoad = () => {
    initializeMap();
  };

  // Update marker when selectedLocation changes
  useEffect(() => {
    if (isMapInitialized && mapInstanceRef.current) {
      const L = window.L;

      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }

      // Add new marker
      if (selectedLocation) {
        markerRef.current = L.marker(
          [selectedLocation.lat, selectedLocation.lng],
          {
            draggable: true,
          }
        ).addTo(mapInstanceRef.current);

        // Center map on marker
        mapInstanceRef.current.setView(
          [selectedLocation.lat, selectedLocation.lng],
          14
        );

        // Handle marker drag end
        markerRef.current.on("dragend", function (e: any) {
          const position = e.target.getLatLng();
          onLocationSelect(position.lat, position.lng);
        });
      }
    }
  }, [selectedLocation, isMapInitialized, onLocationSelect]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Load Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* Load Leaflet JS */}
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        onLoad={handleScriptLoad}
      />

      <div className="relative h-full w-full">
        {!isMapInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <p>Cargando mapa...</p>
          </div>
        )}
        <div ref={mapRef} className="h-full w-full"></div>
      </div>
    </>
  );
}
