"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { Report } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";
import "../public-map/public-map.css";

interface PublicMapComponentProps {
  reports: Report[];
  onReportSelect: (report: Report) => void;
  selectedReport: Report | null;
  mapRef: React.RefObject<any>;
}

export function PublicMapComponent({
  reports,
  onReportSelect,
  selectedReport,
  mapRef,
}: PublicMapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const markerClusterRef = useRef<any>(null);
  const mapInitializedRef = useRef(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || map || mapInitializedRef.current) return;

    // Ensure Leaflet is loaded
    if (!window.L) {
      console.error("Leaflet not loaded yet");
      return;
    }

    try {
      const L = window.L;

      // Set flag to prevent double initialization
      mapInitializedRef.current = true;

      // Create map instance
      const mapInstance = L.map(mapContainerRef.current, {
        // Add options to prevent initialization errors
        attributionControl: true,
        zoomControl: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        dragging: true,
      }).setView([-27.33, -55.86], 13);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance);

      // Create marker cluster group if available
      let markerCluster;
      if (L.markerClusterGroup) {
        markerCluster = L.markerClusterGroup();
        mapInstance.addLayer(markerCluster);
        markerClusterRef.current = markerCluster;
      }

      setMap(mapInstance);

      // Expose map instance through ref
      if (mapRef && typeof mapRef === "object") {
        (mapRef as any).current = mapInstance;
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      // Reset the flag if initialization fails
      mapInitializedRef.current = false;
    }

    return () => {
      if (map) {
        map.remove();
        setMap(null);
        if (mapRef && typeof mapRef === "object") {
          (mapRef as any).current = null;
        }
        // Reset the initialization flag on cleanup
        mapInitializedRef.current = false;
      }
    };
  }, [mapRef, map]);

  // Update markers when reports change
  useEffect(() => {
    if (!map) return;

    const L = window.L;
    if (!L) return;

    // Clear existing markers
    if (markerClusterRef.current) {
      markerClusterRef.current.clearLayers();
    } else {
      Object.values(markersRef.current).forEach((marker) =>
        map.removeLayer(marker)
      );
    }

    markersRef.current = {};

    // Add new markers
    reports.forEach((report) => {
      // Check for latitude and longitude directly instead of the nested location object
      if (report.latitude === undefined || report.longitude === undefined)
        return;

      // Determine marker color based on status
      let markerColor = "orange"; // pending
      if (report.status === "IN_PROGRESS") markerColor = "blue";
      if (report.status === "RESOLVED") markerColor = "green";
      if (report.status === "REJECTED") markerColor = "gray";

      // Create custom icon
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: ${markerColor}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      // Create marker with the actual latitude and longitude
      const marker = L.marker([report.latitude, report.longitude], {
        icon,
      });

      // Create popup content
      const popupContent = document.createElement("div");
      popupContent.className = "pothole-popup";

      // Create a more detailed popup with image thumbnail
      popupContent.innerHTML = `
        <div class="popup-header">
          <h3>${report.title || "Reporte de Bache"}</h3>
          <div class="popup-badges">
            <span class="popup-badge popup-badge-${report.status.toLowerCase()}">${getStatusText(
        report.status
      )}</span>
            <span class="popup-badge popup-badge-severity">${getSeverityText(
              report.severity
            )}</span>
          </div>
        </div>
        <div class="popup-image">
          <img src="${report.picture}" alt="Imagen del bache" />
        </div>
        <p class="popup-description">${report.description.substring(0, 60)}${
        report.description.length > 60 ? "..." : ""
      }</p>
      `;

      // Add view details button
      const detailsButton = document.createElement("button");
      detailsButton.className =
        "bg-primary text-white px-3 py-1 rounded text-sm mt-2 flex items-center justify-center w-full";
      detailsButton.innerHTML =
        'Ver detalles <svg class="ml-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
      detailsButton.onclick = (e) => {
        e.preventDefault();
        onReportSelect(report);
        map.closePopup();
      };
      popupContent.appendChild(detailsButton);

      // Bind popup to marker
      marker.bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 200,
          className: "custom-popup",
        }).setContent(popupContent)
      );

      // Add marker to cluster or map
      if (markerClusterRef.current) {
        markerClusterRef.current.addLayer(marker);
      } else {
        marker.addTo(map);
      }

      // Store marker reference
      markersRef.current[report.id] = marker;
    });

    // If we have reports but no markers, likely something went wrong
    if (reports.length > 0 && Object.keys(markersRef.current).length === 0) {
      console.warn("No markers created from reports. Check location data.");
    }
  }, [map, reports, onReportSelect]);

  // Highlight selected report marker
  useEffect(() => {
    if (!map || !selectedReport) return;

    const marker = markersRef.current[selectedReport.id];
    if (
      marker &&
      selectedReport.latitude !== undefined &&
      selectedReport.longitude !== undefined
    ) {
      marker.openPopup();
      map.setView([selectedReport.latitude, selectedReport.longitude], 16);
    }
  }, [map, selectedReport]);

  // Helper function to get status text
  function getStatusText(status: string): string {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "IN_PROGRESS":
        return "En proceso";
      case "RESOLVED":
        return "Resuelto";
      case "REJECTED":
        return "Rechazado";
      default:
        return status;
    }
  }

  // Helper function to get severity text
  function getSeverityText(severity: string): string {
    switch (severity) {
      case "LOW":
        return "Leve";
      case "MEDIUM":
        return "Moderado";
      case "HIGH":
        return "Grave";
      default:
        return severity;
    }
  }

  return (
    <div className="map-container">
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
