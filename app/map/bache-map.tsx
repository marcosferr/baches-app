"use client"

import { MapPin } from "lucide-react"

interface Bache {
  id: string
  lat: number
  lng: number
  status: "pending" | "in_progress" | "resolved"
  severity: "minor" | "moderate" | "severe"
}

interface BacheMapProps {
  baches: Bache[]
  onBacheSelect: (bacheId: string) => void
  selectedBacheId?: string
}

export function BacheMap({ baches, onBacheSelect, selectedBacheId }: BacheMapProps) {
  // En un caso real, usaríamos una biblioteca como Google Maps o Leaflet
  // Esta es una simulación simple para el propósito de este ejemplo

  const getStatusColor = (status: Bache["status"]) => {
    switch (status) {
      case "pending":
        return "text-orange-500"
      case "in_progress":
        return "text-blue-500"
      case "resolved":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="relative h-full w-full bg-[url('/placeholder.svg?height=800&width=1200')] bg-cover bg-center">
      {baches.map((bache) => (
        <div
          key={bache.id}
          className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
            selectedBacheId === bache.id ? "scale-150 z-10" : ""
          }`}
          style={{
            left: `${bache.lng}%`,
            top: `${bache.lat}%`,
          }}
          onClick={() => onBacheSelect(bache.id)}
          role="button"
          aria-label={`Bache en posición ${bache.lat}, ${bache.lng}`}
        >
          <MapPin className={`h-6 w-6 drop-shadow-md ${getStatusColor(bache.status)}`} />
        </div>
      ))}
    </div>
  )
}

