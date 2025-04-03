"use client"

import { useState } from "react"
import { MapPin, Filter, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import MapaReportes from "@/components/mapa-reportes/mapa-reportes"
import { BacheDetails } from "./bache-details"

// Datos de ejemplo
const mockBaches = [
  {
    id: "1",
    lat: 30,
    lng: 30,
    status: "pending",
    severity: "moderate",
    address: "Av. Independencia 1234",
    reportDate: "2023-10-15",
    description: "Bache de tamaño mediano en el carril derecho",
    image: "/placeholder.svg?height=300&width=400",
    reporter: "Juan Pérez",
  },
  {
    id: "2",
    lat: 40,
    lng: 60,
    status: "in_progress",
    severity: "severe",
    address: "Calle San Martín 567",
    reportDate: "2023-10-10",
    description: "Bache grande que ocupa todo el ancho de la calle",
    image: "/placeholder.svg?height=300&width=400",
    reporter: "María González",
  },
  {
    id: "3",
    lat: 70,
    lng: 40,
    status: "resolved",
    severity: "minor",
    address: "Ruta 1 km 23",
    reportDate: "2023-09-28",
    description: "Pequeño bache en la banquina",
    image: "/placeholder.svg?height=300&width=400",
    reporter: "Carlos Rodríguez",
  },
]

export default function MapPage() {
  const [selectedBache, setSelectedBache] = useState<(typeof mockBaches)[0] | null>(null)
  const [filters, setFilters] = useState({
    pending: true,
    in_progress: true,
    resolved: true,
    minor: true,
    moderate: true,
    severe: true,
  })

  const handleBacheSelect = (bacheId: string) => {
    const bache = mockBaches.find((b) => b.id === bacheId)
    setSelectedBache(bache || null)
  }

  const handleFilterChange = (key: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const filteredBaches = mockBaches.filter((bache) => {
    return filters[bache.status as keyof typeof filters] && filters[bache.severity as keyof typeof filters]
  })

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <h1 className="text-2xl font-bold">Mapa de Baches</h1>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Estado</h4>
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pending"
                        checked={filters.pending}
                        onCheckedChange={() => handleFilterChange("pending")}
                      />
                      <Label htmlFor="pending" className="font-normal">
                        Pendiente
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="in_progress"
                        checked={filters.in_progress}
                        onCheckedChange={() => handleFilterChange("in_progress")}
                      />
                      <Label htmlFor="in_progress" className="font-normal">
                        En Proceso
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="resolved"
                        checked={filters.resolved}
                        onCheckedChange={() => handleFilterChange("resolved")}
                      />
                      <Label htmlFor="resolved" className="font-normal">
                        Resuelto
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Gravedad</h4>
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="minor"
                        checked={filters.minor}
                        onCheckedChange={() => handleFilterChange("minor")}
                      />
                      <Label htmlFor="minor" className="font-normal">
                        Leve
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="moderate"
                        checked={filters.moderate}
                        onCheckedChange={() => handleFilterChange("moderate")}
                      />
                      <Label htmlFor="moderate" className="font-normal">
                        Moderado
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="severe"
                        checked={filters.severe}
                        onCheckedChange={() => handleFilterChange("severe")}
                      />
                      <Label htmlFor="severe" className="font-normal">
                        Grave
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="gap-2">
            <Layers className="h-4 w-4" />
            Capas
          </Button>
        </div>
      </div>

      <div className="relative flex flex-1">
        <div className="h-full w-full">
          <MapaReportes />
        </div>

        {selectedBache && (
          <div className="absolute bottom-4 left-4 right-4 z-10 md:right-auto md:w-96">
            <Card>
              <CardContent className="p-0">
                <BacheDetails bache={selectedBache} onClose={() => setSelectedBache(null)} />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-10">
          <div className="flex flex-col gap-2">
            <div className="rounded-md bg-background p-2 shadow-md">
              <div className="grid gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-500">
                    <MapPin className="h-3 w-3" />
                  </Badge>
                  <span>Pendiente</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500">
                    <MapPin className="h-3 w-3" />
                  </Badge>
                  <span>En Proceso</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">
                    <MapPin className="h-3 w-3" />
                  </Badge>
                  <span>Resuelto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

