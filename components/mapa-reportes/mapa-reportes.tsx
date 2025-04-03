"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import "./mapa-reportes.css"

// Coordinates for Encarnación, Paraguay
const ENCARNACION_COORDS = [-27.3364, -55.8675]
const DEFAULT_ZOOM = 14

// Sample pothole reports data
const potholeReports = [
  {
    id: 1,
    position: [-27.3364, -55.8675], // Center of Encarnación
    severity: "severe",
    description: "Bache profundo en la avenida principal, peligroso para motocicletas",
    status: "pending",
    reportDate: "2023-10-15",
  },
  {
    id: 2,
    position: [-27.33, -55.87], // Slightly north
    severity: "moderate",
    description: "Bache de tamaño mediano cerca del semáforo, afecta el tráfico",
    status: "in_progress",
    reportDate: "2023-10-10",
  },
  {
    id: 3,
    position: [-27.34, -55.86], // Southeast
    severity: "minor",
    description: "Pequeño bache en la esquina, no muy profundo pero en crecimiento",
    status: "resolved",
    reportDate: "2023-09-28",
  },
]

export default function MapaReportes() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const mapInstanceRef = useRef<any>(null)

  // Initialize map after Leaflet script is loaded
  const initializeMap = () => {
    if (!mapRef.current || !window.L || isMapInitialized) return

    try {
      const L = window.L

      // Create map instance
      const map = L.map(mapRef.current).setView(ENCARNACION_COORDS, DEFAULT_ZOOM)
      mapInstanceRef.current = map

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Create custom icon function
      const createCustomIcon = (status: string) => {
        let color = "gray"

        if (status === "pending") {
          color = "orange"
        } else if (status === "in_progress") {
          color = "blue"
        } else if (status === "resolved") {
          color = "green"
        }

        return L.icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      }

      // Add markers for each report
      potholeReports.forEach((report) => {
        const marker = L.marker(report.position as [number, number], {
          icon: createCustomIcon(report.status),
        }).addTo(map)

        // Add popup with report details
        marker.bindPopup(`
          <div class="pothole-popup">
            <h3>Reporte de Bache #${report.id}</h3>
            <p><strong>Descripción:</strong> ${report.description}</p>
            <p><strong>Severidad:</strong> ${report.severity}</p>
            <p><strong>Estado:</strong> ${report.status}</p>
            <p><strong>Fecha:</strong> ${report.reportDate}</p>
          </div>
        `)
      })

      // Handle window resize
      const handleResize = () => {
        if (map) {
          map.invalidateSize()
        }
      }

      window.addEventListener("resize", handleResize)

      // Initial invalidation after component mounts
      setTimeout(handleResize, 100)

      setIsMapInitialized(true)
    } catch (error) {
      console.error("Error initializing map:", error)
    }
  }

  // Handle script load event
  const handleScriptLoad = () => {
    initializeMap()
  }

  // Cleanup function
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      window.removeEventListener("resize", () => {})
    }
  }, [])

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

      <div className="mapa-container">
        {!isMapInitialized && <div className="mapa-loading">Cargando mapa...</div>}
        <div ref={mapRef} className="mapa"></div>
      </div>
    </>
  )
}

