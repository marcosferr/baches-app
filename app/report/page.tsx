"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle,
  Crosshair,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/protected-route";
import { ReportMap } from "./report-map";
import { ApiService } from "@/lib/api-service";
import "./report.css";

// Map severity from UI values to API values
const severityMap = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
} as const;

export default function ReportPage() {
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "current">("search");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setLocation({ lat, lng });
  }, []);

  const handleGetCurrentLocation = useCallback(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      // Only set the active tab if we're not already in the "current" tab
      if (activeTab !== "current") {
        setActiveTab("current");
      }

      // Get the geolocation
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);
        },
        (error) => {
          toast({
            title: "Error de geolocalización",
            description:
              "No se pudo obtener tu ubicación actual. Por favor selecciona manualmente en el mapa.",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast, setLocation, setActiveTab, activeTab]);

  // Handle tab changes
  useEffect(() => {
    // If switching to "current" tab, try to get current location
    if (activeTab === "current") {
      // Small delay to ensure the tab content is rendered
      setTimeout(() => {
        if (!location) {
          handleGetCurrentLocation();
        }
      }, 100);
    }
  }, [activeTab, location, handleGetCurrentLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewImage || !location || !description) {
      toast({
        title: "Error en el formulario",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create report data with proper structure for ApiService
      const reportData = {
        picture: previewImage,
        description,
        severity: severityMap[severity],
        location: {
          lat: location.lat,
          lng: location.lng,
          address: address.trim() || null,
        },
      };

      // Submit report using API service
      await ApiService.createReport(reportData);

      setIsSubmitting(false);
      setIsSuccess(true);

      // Reset form after showing success
      setTimeout(() => {
        setIsSuccess(false);
        setPreviewImage(null);
        setLocation(null);
        setAddress("");
        setDescription("");
        setSeverity("medium");
      }, 3000);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Error al enviar el reporte",
        description:
          "Ha ocurrido un error al enviar tu reporte. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["citizen", "admin"]}>
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl">
          Reportar un Bache
        </h1>

        {isSuccess ? (
          <Card className="bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-semibold">¡Reporte Enviado!</h2>
                <p className="text-muted-foreground">
                  Tu reporte ha sido enviado correctamente. Un administrador lo
                  revisará pronto.
                </p>
                <Button onClick={() => setIsSuccess(false)}>Volver</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Bache</CardTitle>
                  <CardDescription>
                    Proporciona los detalles del bache que has encontrado
                  </CardDescription>
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
                          onClick={() =>
                            document.getElementById("photo")?.click()
                          }
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
                      onValueChange={(value) =>
                        setSeverity(value as "low" | "medium" | "high")
                      }
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
                  <CardDescription>
                    Selecciona la ubicación exacta del bache en el mapa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) =>
                      setActiveTab(value as "search" | "current")
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="search">
                        Buscar en el mapa
                      </TabsTrigger>
                      <TabsTrigger value="current">
                        Usar mi ubicación
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="search" className="space-y-4">
                      <div className="h-[250px] sm:h-[300px] w-full overflow-hidden rounded-lg border">
                        <ReportMap
                          key="search-map"
                          onLocationSelect={handleLocationSelect}
                          selectedLocation={location}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Haz clic en el mapa para seleccionar la ubicación exacta
                        del bache. También puedes arrastrar el marcador para
                        ajustar la posición.
                      </p>
                    </TabsContent>
                    <TabsContent value="current" className="space-y-4">
                      <div className="h-[250px] sm:h-[300px] w-full overflow-hidden rounded-lg border">
                        <ReportMap
                          key="current-map"
                          onLocationSelect={handleLocationSelect}
                          selectedLocation={location}
                        />
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
                        Latitud: {location.lat.toFixed(6)}, Longitud:{" "}
                        {location.lng.toFixed(6)}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección (opcional)</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          placeholder="Ej. Avenida Caballero 123, Encarnación"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Proporciona una dirección para ayudar a ubicar el bache
                      más fácilmente
                    </p>
                  </div>

                  {!location && (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        Por favor selecciona la ubicación del bache en el mapa
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !previewImage || !location || !description || isSubmitting
                    }
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
  );
}
