"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Camera, Upload, AlertTriangle, CheckCircle, Crosshair } from "lucide-react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ApiService } from "@/lib/api-service"
import { ProtectedRoute } from "@/components/protected-route"
import type { CreateReportDTO } from "@/types"
import "./report.css"

// Coordinates for Encarnación, Paraguay
const ENCARNACION_COORDS = [-27.3364, -55.8675]
const DEFAULT_ZOOM = 14

export default function ReportPage() {
  const { toast } = useToast()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<"search" | "current">("search")
  const [isMapReady, setIsMapReady] = useState(false)

  // Use refs instead of state for map and marker to avoid re-renders
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!previewImage || !location || !description) {
      toast({
        title: "Error en el formulario",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create report data
      const reportData: CreateReportDTO = {
        picture: previewImage,
        description,
        severity,
        location: {
          lat: location.lat,
          lng: location.lng,
        },
      }

      // Submit report to API
      await ApiService.createReport(reportData)

      setIsSubmitting(false)
      setIsSuccess(true)

      // Reset form after showing success
      setTimeout(() => {
        setIsSuccess(false)
        setPreviewImage(null)
        setLocation(null)
        setDescription("")
        setSeverity("medium")

        // Reset marker if exists
        if (markerRef.current) {
          markerRef.current.remove()
          markerRef.current = null
        }
      }, 3000)
    } catch (error) {
      setIsSubmitting(false)
      toast({
        title: "Error al enviar el reporte",
        description: "Ha ocurrido un error al enviar tu reporte. Por favor intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleGetCurrentLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(newLocation)
          setActiveTab("current")

          // Update marker if map is ready
          if (isMapReady && mapRef.current) {
            updateMarker(newLocation.lat, newLocation.lng)
          }
        },
        (error) => {
          console.error("Error obteniendo la ubicación:", error)
          toast({
            title: "Error de geolocalización",
            description: "No se pudo obtener tu ubicación actual. Por favor selecciona manualmente en el mapa.",
            variant: "destructive",
          })
        },
      )
    }
  }

  // Create or update marker
  const updateMarker = (lat: number, lng: number) => {
    if (typeof window === "undefined" || !window.L || !mapRef.current) return

    const L = window.L

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove()
    }

    // Create new marker
    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    }).addTo(mapRef.current)

    // Center map on marker
    mapRef.current.setView([lat, lng], DEFAULT_ZOOM)

    // Add drag end handler
    marker.on("dragend", () => {
      const position = marker.getLatLng()
      setLocation({ lat: position.lat, lng: position.lng })
    })

    markerRef.current = marker
  }

  // Initialize map
  const initializeMap = () => {
    if (typeof window === "undefined" || !window.L || !mapContainerRef.current) return

    // Clean up existing map
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    try {
      const L = window.L

      // Create map
      const map = L.map(mapContainerRef.current).setView(ENCARNACION_COORDS, DEFAULT_ZOOM)
      mapRef.current = map

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add click handler
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng
        setLocation({ lat, lng })
        updateMarker(lat, lng)
      })

      // Add existing marker if location exists
      if (location) {
        updateMarker(location.lat, location.lng)
      }

      // Force map to recalculate size
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize()
        }
      }, 100)
    } catch (error) {
      console.error("Error initializing map:", error)
      toast({
        title: "Error al cargar el mapa",
        description: "No se pudo inicializar el mapa. Por favor recarga la página.",
        variant: "destructive",
      })
    }
  }

  // Handle script load
  const handleScriptLoad = () => {
    setIsMapReady(true)
  }

  // Initialize map when script is loaded and tab changes
  useEffect(() => {
    if (!isMapReady) return

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeMap()
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [isMapReady, activeTab])

  // Update marker when location changes
  useEffect(() => {
    if (isMapReady && mapRef.current && location) {
      updateMarker(location.lat, location.lng)
    }
  }, [isMapReady, location])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <ProtectedRoute allowedRoles={["citizen", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-3xl font-bold">Reportar un Bache</h1>

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

        {isSuccess ? (
          <Card className="bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-semibold">¡Reporte Enviado!</h2>
                <p className="text-muted-foreground">
                  Tu reporte ha sido enviado correctamente. Un administrador lo revisará pronto.
                </p>
                <Button onClick={() => setIsSuccess(false)}>Volver</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Bache</CardTitle>
                  <CardDescription>Proporciona los detalles del bache que has encontrado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="photo">Foto del Bache</Label>
                    <div className="flex flex-col gap-4">
                      {previewImage ? (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                          <img
                            src={previewImage || "/placeholder.svg"}
                            alt="Vista previa"
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute right-2 top-2"
                            onClick={() => setPreviewImage(null)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Arrastra una imagen o haz clic para seleccionar
                          </p>
                        </div>
                      )}
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => document.getElementById("photo")?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          Subir Foto
                        </Button>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe el problema (tamaño, profundidad, etc.)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gravedad del Daño</Label>
                    <RadioGroup
                      value={severity}
                      onValueChange={(value) => setSeverity(value as "low" | "medium" | "high")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="low" />
                        <Label htmlFor="low" className="font-normal">
                          Leve
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium" className="font-normal">
                          Moderado
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="high" />
                        <Label htmlFor="high" className="font-normal">
                          Grave
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ubicación</CardTitle>
                  <CardDescription>Selecciona la ubicación exacta del bache en el mapa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "search" | "current")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="search">Buscar en el mapa</TabsTrigger>
                      <TabsTrigger value="current">Usar mi ubicación</TabsTrigger>
                    </TabsList>
                    <TabsContent value="search" className="space-y-4">
                      <div className="h-[300px] w-full overflow-hidden rounded-lg border">
                        <div ref={mapContainerRef} className="h-full w-full"></div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Haz clic en el mapa para seleccionar la ubicación exacta del bache. También puedes arrastrar el
                        marcador para ajustar la posición.
                      </p>
                    </TabsContent>
                    <TabsContent value="current" className="space-y-4">
                      <div className="h-[300px] w-full overflow-hidden rounded-lg border">
                        <div ref={mapContainerRef} className="h-full w-full"></div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleGetCurrentLocation}
                      >
                        <Crosshair className="h-4 w-4" />
                        Actualizar Mi Ubicación Actual
                      </Button>
                    </TabsContent>
                  </Tabs>

                  {location && (
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      <div className="font-medium">Ubicación seleccionada:</div>
                      <div className="mt-1 text-muted-foreground">
                        Latitud: {location.lat.toFixed(6)}, Longitud: {location.lng.toFixed(6)}
                      </div>
                    </div>
                  )}

                  {!location && (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Por favor selecciona la ubicación del bache en el mapa</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!previewImage || !location || !description || isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Reporte"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        )}
      </div>
    </ProtectedRoute>
  )
}

