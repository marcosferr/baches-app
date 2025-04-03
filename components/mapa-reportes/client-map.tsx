"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"

// Types for our props
interface ClientMapProps {
  center: [number, number]
  zoom: number
  reports: {
    id: number
    position: [number, number]
    severity: string
    description: string
    status: string
    reportDate: string
  }[]
}

export default function ClientMap({ center, zoom, reports }: ClientMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Only run this code on the client side
    if (typeof window === "undefined") return

    // Dynamically import Leaflet
    const initializeMap = async () => {
      try {
        // Import Leaflet dynamically
        const L = (await import("leaflet")).default

        // Fix Leaflet default icon issue
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        })

        // Create custom icon function
        const createCustomIcon = (severity: string, status: string) => {
          let color = "gray"

          if (status === "pending") {
            color = "orange"
          } else if (status === "in_progress") {
            color = "blue"
          } else if (status === "resolved") {
            color = "green"
          }

          return new L.Icon({
            iconUrl: `/markers/${color}-marker.svg`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })
        }

        // Initialize map if it doesn't exist yet
        if (!mapInstanceRef.current && mapRef.current) {
          // Create map instance
          mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom)

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(mapInstanceRef.current)

          // Add markers for each report
          reports.forEach((report) => {
            const marker = L.marker(report.position, {
              icon: createCustomIcon(report.severity, report.status),
            }).addTo(mapInstanceRef.current)

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
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize()
            }
          }

          window.addEventListener("resize", handleResize)

          // Initial invalidation after component mounts
          setTimeout(handleResize, 100)
        }
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initializeMap()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      window.removeEventListener("resize", () => {})
    }
  }, [center, zoom, reports])

  return <div ref={mapRef} className="mapa"></div>
}

