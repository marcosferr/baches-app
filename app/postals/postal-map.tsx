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
  const leafletLoadingRef = useRef<boolean>(false);

  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the map
  useEffect(() => {
    // Set loading state
    setIsLoading(true);

    // Ensure the map container is rendered before attempting to initialize
    const checkMapContainer = () => {
      if (typeof window === "undefined") {
        return false;
      }

      if (!mapRef.current) {
        // If map container is not ready yet, retry after a short delay
        setTimeout(() => {
          if (!isMapInitialized && !leafletLoadingRef.current) {
            loadAndInitializeMap();
          }
        }, 100);
        return false;
      }

      return true;
    };

    const loadAndInitializeMap = async () => {
      // Check if already initialized or in the process of initializing
      if (isMapInitialized || leafletLoadingRef.current) {
        return;
      }

      // Check if map container is ready
      if (!checkMapContainer()) {
        return;
      }

      // Prevent multiple initialization attempts
      if (leafletLoadingRef.current) return;
      leafletLoadingRef.current = true;

      try {
        // Check if Leaflet is already loaded
        if (window.L) {
          // Delay initialization slightly to ensure DOM is fully ready
          setTimeout(initializeMap, 100);
          return;
        }

        // Check if Leaflet script is already being loaded
        const existingScript = document.querySelector('script[src*="leaflet"]');
        if (existingScript) {
          existingScript.addEventListener("load", () => {
            // Wait a bit to ensure Leaflet is fully initialized
            setTimeout(initializeMap, 200);
          });
          return;
        }

        // Load Leaflet CSS if not already loaded
        const existingLink = document.querySelector('link[href*="leaflet"]');
        if (!existingLink) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin = "";
          document.head.appendChild(link);
        }

        // Load Leaflet script dynamically
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";

        // Create a promise to wait for script load
        await new Promise<void>((resolve) => {
          script.onload = () => {
            // Wait a bit to ensure Leaflet is fully initialized
            setTimeout(() => {
              initializeMap();
              resolve();
            }, 200);
          };
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error("Error loading Leaflet:", error);
        setIsLoading(false);
        leafletLoadingRef.current = false;
      }
    };

    // Start the initialization process with a slight delay to ensure DOM is ready
    setTimeout(loadAndInitializeMap, 100);

    return () => {
      // Clean up map instance when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setIsMapInitialized(false);
      leafletLoadingRef.current = false;
    };
  }, []);

  // Update polygon when points change
  useEffect(() => {
    if (!isMapInitialized || !mapInstanceRef.current) return;

    updatePolygon();
  }, [points, isMapInitialized]);

  // Initialize the map
  const initializeMap = () => {
    // Prevent initializing if already initialized
    if (isMapInitialized && mapInstanceRef.current) {
      leafletLoadingRef.current = false;
      setIsLoading(false);
      return;
    }

    try {
      if (!window.L) {
        // Don't log an error, just silently return and let the retry mechanism handle it
        setIsLoading(false);
        leafletLoadingRef.current = false;
        return;
      }

      // Double-check map container is available (should never happen due to earlier check)
      if (!mapRef.current) {
        // Don't log an error, just silently return and let the retry mechanism handle it
        setIsLoading(false);
        leafletLoadingRef.current = false;
        return;
      }

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
      try {
        const map = L.map(mapRef.current).setView([-27.3364, -55.8675], 14);
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Add click handler to add markers
        map.on("click", handleMapClick);

        // Set states after successful initialization
        setIsMapInitialized(true);
        setIsLoading(false);
        leafletLoadingRef.current = false;
      } catch (mapError) {
        console.error("Error creating map instance:", mapError);
        // If map creation fails, retry after a short delay, but only if not already initialized
        if (!isMapInitialized) {
          setTimeout(() => {
            if (!isMapInitialized) {
              setIsLoading(true);
              leafletLoadingRef.current = false;
              initializeMap();
            }
          }, 500);
        } else {
          setIsLoading(false);
          leafletLoadingRef.current = false;
        }
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setIsLoading(false);
      leafletLoadingRef.current = false;
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

  return (
    <div className="h-full w-full relative z-0">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full relative z-0" />
    </div>
  );
}
