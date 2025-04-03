"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"

// Import Leaflet CSS
import "leaflet/dist/leaflet.css"

// Types for our props
interface MapComponentProps {
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

// Fix for Leaflet default icon issue in Next.js
const fixLeafletIcon = () => {
  // Delete the default icon reference
  delete L.Icon.Default.prototype._getIconUrl

  // Set up the new icon paths manually
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

// Custom marker icons based on severity and status
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

// Component to handle map resize
function MapResizer() {
  const map = useMap()

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize()
    }

    window.addEventListener("resize", handleResize)

    // Initial invalidation after component mounts
    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [map])

  return null
}

const MapComponent = ({ center, zoom, reports }: MapComponentProps) => {
  useEffect(() => {
    // Fix Leaflet icon issues
    fixLeafletIcon()
  }, [])

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="mapa">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {reports.map((report) => (
        <Marker key={report.id} position={report.position} icon={createCustomIcon(report.severity, report.status)}>
          <Popup>
            <div className="pothole-popup">
              <h3>Reporte de Bache #{report.id}</h3>
              <p>
                <strong>Descripción:</strong> {report.description}
              </p>
              <p>
                <strong>Severidad:</strong> {report.severity}
              </p>
              <p>
                <strong>Estado:</strong> {report.status}
              </p>
              <p>
                <strong>Fecha:</strong> {report.reportDate}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      <MapResizer />
    </MapContainer>
  )
}

export default MapComponent

