"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Script from "next/script"
import { useToast } from "@/hooks/use-toast"
import type { Report } from "@/types"
import "./public-map.css"

interface PublicMapComponentProps {
  reports: Report[]
  onReportSelect: (report: Report) => void
  selectedReport: Report | null
  mapRef: React.MutableRefObject<any>
}

export function PublicMapComponent({ reports, onReportSelect, selectedReport, mapRef }: PublicMapComponentProps) {
  const { toast } = useToast()
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)
  const [isMarkerClusterLoaded, setIsMarkerClusterLoaded] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any>({})
  const clusterGroupRef = useRef<any>(null)

  // Coordinates for Encarnación, Paraguay
  const ENCARNACION_COORDS: [number, number] = [-27.3364, -55.8675]
  const DEFAULT_ZOOM = 13

  // Handle script load events
  const handleLeafletLoad = () => {
    setIsLeafletLoaded(true)
  }

  const handleMarkerClusterLoad = () => {
    setIsMarkerClusterLoaded(true)
  }

  // Check if both scripts are loaded
  const areScriptsLoaded = isLeafletLoaded && isMarkerClusterLoaded

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !areScriptsLoaded || !window.L) return

    const initMap = () => {
      try {
        const L = window.L

        // Fix Leaflet default icon issue
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

          // Add size variation based on severity
          let size = [25, 41]
          let anchor = [12, 41]

          if (severity === "high") {
            size = [30, 49]
            anchor = [15, 49]
          } else if (severity === "low") {
            size = [20, 33]
            anchor = [10, 33]
          }

          return new L.Icon({
            iconUrl: `/markers/${color}-marker.svg`,
            iconSize: size,
            iconAnchor: anchor,
            popupAnchor: [1, -34],
          })
        }

        // Initialize map if it doesn't exist
        if (!mapRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: ENCARNACION_COORDS,
            zoom: DEFAULT_ZOOM,
            zoomControl: false,
            attributionControl: true,
          })

          // Add zoom control to the top-right
          L.control.zoom({ position: "topright" }).addTo(map)

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map)

          // Create a marker cluster group
          const clusterGroup = L.markerClusterGroup({
            disableClusteringAtZoom: 16,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 40,
          })

          map.addLayer(clusterGroup)
          clusterGroupRef.current = clusterGroup
          mapRef.current = map

          // Handle resize
          const handleResize = () => {
            if (mapRef.current) {
              mapRef.current.invalidateSize()
            }
          }

          window.addEventListener("resize", handleResize)
          setTimeout(handleResize, 100)
        }

        setIsMapInitialized(true)
      } catch (error) {
        console.error("Error initializing map:", error)
        toast({
          title: "Error al cargar el mapa",
          description: "No se pudo inicializar el mapa. Por favor recarga la página.",
          variant: "destructive",
        })
      }
    }

    initMap()

    // Cleanup
    return () => {
      window.removeEventListener("resize", () => {})
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        clusterGroupRef.current = null
        markersRef.current = {}
      }
    }
  }, [toast, mapRef, areScriptsLoaded])

  // Update markers when reports change
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current || !clusterGroupRef.current || !window.L) return

    const updateMarkers = () => {
      try {
        const L = window.L
        const currentMarkerIds = Object.keys(markersRef.current)
        const newReportIds = reports.map((r) => r.id)

        // Remove markers that are no longer in the reports
        currentMarkerIds.forEach((id) => {
          if (!newReportIds.includes(id)) {
            if (markersRef.current[id]) {
              clusterGroupRef.current.removeLayer(markersRef.current[id])
              delete markersRef.current[id]
            }
          }
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

          // Add size variation based on severity
          let size = [25, 41]
          let anchor = [12, 41]

          if (severity === "high") {
            size = [30, 49]
            anchor = [15, 49]
          } else if (severity === "low") {
            size = [20, 33]
            anchor = [10, 33]
          }

          return new L.Icon({
            iconUrl: `/markers/${color}-marker.svg`,
            iconSize: size,
            iconAnchor: anchor,
            popupAnchor: [1, -34],
          })
        }

        // Add or update markers for each report
        reports.forEach((report) => {
          if (!report.location) return

          const latLng: [number, number] = [report.location.lat, report.location.lng]

          // If marker already exists, update it
          if (markersRef.current[report.id]) {
            const marker = markersRef.current[report.id]
            marker.setLatLng(latLng)
            marker.setIcon(createCustomIcon(report.severity, report.status))
          }
          // Otherwise create a new marker
          else {
            const marker = L.marker(latLng, {
              icon: createCustomIcon(report.severity, report.status),
            })

            // Add click handler
            marker.on("click", () => {
              onReportSelect(report)
            })

            // Add to cluster group and store reference
            clusterGroupRef.current.addLayer(marker)
            markersRef.current[report.id] = marker
          }
        })

        // If there are reports and no report is selected, fit bounds to show all markers
        if (reports.length > 0 && !selectedReport) {
          const group = L.featureGroup(Object.values(markersRef.current))
          const bounds = group.getBounds()
          if (bounds.isValid()) {
            mapRef.current.fitBounds(bounds, { padding: [50, 50] })
          }
        }
      } catch (error) {
        console.error("Error updating markers:", error)
      }
    }

    updateMarkers()
  }, [reports, isMapInitialized, onReportSelect, selectedReport])

  // Update selected marker when selectedReport changes
  useEffect(() => {
    if (!isMapInitialized || !mapRef.current || !selectedReport) return

    const marker = markersRef.current[selectedReport.id]
    if (marker && selectedReport.location) {
      mapRef.current.setView([selectedReport.location.lat, selectedReport.location.lng], 16)

      // Open popup if it exists
      if (marker.getPopup()) {
        marker.openPopup()
      }
    }
  }, [selectedReport, isMapInitialized])

  return (
    <div className="relative h-full w-full">
      {/* Load Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* Load MarkerCluster CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
        crossOrigin=""
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
        crossOrigin=""
      />

      {/* Load Leaflet JS */}
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        onLoad={handleLeafletLoad}
        strategy="beforeInteractive"
      />

      {/* Load MarkerCluster JS */}
      <Script
        src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"
        crossOrigin=""
        onLoad={handleMarkerClusterLoad}
        strategy="beforeInteractive"
      />

      {(!isMapInitialized || !areScriptsLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="h-full w-full"></div>
    </div>
  )
}

