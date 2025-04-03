"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

interface ReportMapProps {
  onLocationSelect: (lat: number, lng: number) => void
  selectedLocation: { lat: number; lng: number } | null
}

export function ReportMap({ onLocationSelect, selectedLocation }: ReportMapProps) {
  // En un caso real, usaríamos una biblioteca como Google Maps o Leaflet
  // Esta es una simulación simple para el propósito de este ejemplo

  const mapRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 }) // Porcentaje en el mapa

  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      // Convertir coordenadas reales a posición en el mapa simulado
      // En un caso real, esto sería manejado por la API del mapa
      setPosition({
        x: ((selectedLocation.lng + 180) / 360) * 100,
        y: ((90 - selectedLocation.lat) / 180) * 100,
      })
    }
  }, [selectedLocation])

  const handleMapClick = (e: React.MouseEvent) => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      setPosition({ x, y })

      // Convertir posición en el mapa a coordenadas simuladas
      // En un caso real, esto sería manejado por la API del mapa
      const lat = 90 - (y / 100) * 180
      const lng = (x / 100) * 360 - 180

      onLocationSelect(lat, lng)
    }
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && mapRef.current) {
      handleMapClick(e)
    }
  }

  return (
    <div
      ref={mapRef}
      className="relative h-full w-full bg-[url('/placeholder.svg?height=600&width=800')] bg-cover bg-center"
      onClick={handleMapClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {/* Marcador de posición */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 animate-bounce"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
      >
        <MapPin className="h-8 w-8 text-orange-500 drop-shadow-md" />
      </div>
    </div>
  )
}

