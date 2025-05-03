"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/protected-route";
import { PostalMap } from "./postal-map";
import { CustomDialog } from "./custom-dialog";

// Add a style tag to override Leaflet z-index
const LeafletZIndexFix = () => (
  <style jsx global>{`
    .leaflet-pane,
    .leaflet-control,
    .leaflet-top,
    .leaflet-bottom {
      z-index: 0 !important;
    }
    .leaflet-popup-pane {
      z-index: 7 !important;
    }
  `}</style>
);

export default function PostalsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [area, setArea] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mapKey, setMapKey] = useState<number>(Date.now());
  const mapInitializedRef = useRef<boolean>(false);

  // Maximum area in square meters (1 km²)
  const MAX_AREA = 300000;

  const handleReset = () => {
    setPolygonPoints([]);
    setArea(0);
  };

  const handleReloadMap = () => {
    // Reset the initialization flag to allow reinitialization
    mapInitializedRef.current = false;
    setMapKey(Date.now());
  };

  // Ensure map is properly initialized when component mounts
  useEffect(() => {
    // Prevent multiple initializations
    if (mapInitializedRef.current) {
      return;
    }
    mapInitializedRef.current = true;

    // Preload Leaflet resources first
    if (typeof window !== "undefined") {
      // Check if Leaflet CSS is already loaded
      const existingLink = document.querySelector('link[href*="leaflet"]');
      if (!existingLink) {
        // Preload CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      // Check if Leaflet script is already loaded
      const existingScript = document.querySelector('script[src*="leaflet"]');
      if (!existingScript && !window.L) {
        // Preload JS
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";

        // Wait for script to load before initializing map
        script.onload = () => {
          // Delay slightly to ensure DOM is ready
          setTimeout(() => {
            setMapKey(Date.now());
          }, 100);
        };

        document.head.appendChild(script);
      } else {
        // If Leaflet is already loaded, initialize map with a slight delay
        setTimeout(() => {
          setMapKey(Date.now());
        }, 100);
      }
    }

    // Cleanup function
    return () => {
      mapInitializedRef.current = false;
    };
  }, []);

  const handleGenerateReport = () => {
    if (polygonPoints.length < 3) {
      alert(
        "Por favor, coloca al menos 3 puntos en el mapa para generar un polígono."
      );
      return;
    }

    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleGeneratePostal = async (name: string) => {
    if (!name.trim()) {
      return;
    }

    try {
      setIsGenerating(true);

      const response = await fetch("/api/postals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          points: polygonPoints,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al generar la postal");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Open the PDF in a new tab
      window.open(url, "_blank");

      // Reset after successful generation
      handleReset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error generating postal:", error);
      alert(
        "Ocurrió un error al generar la postal. Por favor, intenta de nuevo."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <LeafletZIndexFix />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Postales de mi Ciudad</h1>
          <p className="text-muted-foreground">
            Crea postales con imágenes de reportes en áreas específicas de la
            ciudad
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Selecciona un área en el mapa</CardTitle>
              <p className="text-sm text-muted-foreground">
                Haz clic en el mapa para colocar puntos y crear un polígono.
                Necesitas al menos 3 puntos.
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Puntos colocados:{" "}
                    <span className="font-bold">{polygonPoints.length}</span>
                  </p>
                  <p className="text-sm font-medium">
                    Área:{" "}
                    <span className="font-bold">{Math.round(area)} m²</span>
                    {area > MAX_AREA && (
                      <span className="ml-2 text-red-500">
                        (Excede el límite de {MAX_AREA.toLocaleString()} m²)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset}>
                    Reiniciar
                  </Button>
                  <Button variant="outline" onClick={handleReloadMap}>
                    Recargar Mapa
                  </Button>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={
                      polygonPoints.length < 3 ||
                      area > MAX_AREA ||
                      isGenerating
                    }
                  >
                    {isGenerating ? "Generando..." : "Generar Postal"}
                  </Button>
                </div>
              </div>

              <div className="h-[600px] w-full rounded-md border relative z-0">
                <PostalMap
                  key={mapKey}
                  onPointsChange={setPolygonPoints}
                  onAreaChange={setArea}
                  points={polygonPoints}
                  onReset={handleReset}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <CustomDialog
          open={isDialogOpen}
          onClose={handleDialogClose}
          onGenerate={handleGeneratePostal}
          isGenerating={isGenerating}
        />
      </div>
    </ProtectedRoute>
  );
}
