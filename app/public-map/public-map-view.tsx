"use client";

import { useState, useEffect, useRef } from "react";
import { Filter, Layers, Info, MapPin, List, MapIcon, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { ApiService } from "@/lib/api-service";
import { PublicMapComponent } from "./public-map-component";
import { FallbackMap } from "./fallback-map";
import { ReportListItem } from "./report-list-item";
import { ReportDetailView } from "./report-detail-view";
import type { Report } from "@/types";
import Head from "next/head";

export default function PublicMapView() {
  const { toast } = useToast();
  const isMobile = useMobile();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filters, setFilters] = useState({
    pending: true,
    in_progress: true,
    resolved: true,
    low: true,
    medium: true,
    high: true,
  });
  const [view, setView] = useState<"map" | "list">("map");
  const mapRef = useRef<any>(null);
  const leafletLoadedRef = useRef(false);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        // Exclude SUBMITTED reports from public map
        const fetchedReports = await ApiService.getReports({
          status: ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"],
        });
        setReports(fetchedReports);
        console.log("Fetched reports:", fetchedReports);
        setFilteredReports(fetchedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Error",
          description:
            "No se pudieron cargar los reportes. Por favor intenta nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [toast]);

  // Load Leaflet library
  useEffect(() => {
    // Don't try to load it multiple times
    if (leafletLoadedRef.current) return;

    const loadDependencies = async () => {
      try {
        // Check if Leaflet is already available
        if (typeof window !== "undefined" && window.L) {
          setMapLoaded(true);
          leafletLoadedRef.current = true;
          return;
        }

        // Simple function to load a script
        const loadScript = (src: string): Promise<void> => {
          return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () =>
              reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
          });
        };

        // Simple function to load a stylesheet
        const loadStylesheet = (href: string): void => {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = href;
          document.head.appendChild(link);
        };

        // Load all required stylesheets
        loadStylesheet("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");

        // Don't preload marker cluster - load it directly when needed
        loadStylesheet(
          "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
        );
        loadStylesheet(
          "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
        );

        // First load Leaflet
        await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");

        // Wait for Leaflet to be fully initialized
        let attempts = 0;
        while (typeof window.L === "undefined" && attempts < 10) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          attempts++;
        }

        if (!window.L) {
          throw new Error("Leaflet failed to initialize properly");
        }

        // Load MarkerCluster after Leaflet is confirmed to be loaded
        await loadScript(
          "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"
        );

        console.log("Map libraries loaded successfully");
        setMapLoaded(true);
        leafletLoadedRef.current = true;
      } catch (error) {
        console.error("Error loading map libraries:", error);
        setMapError(true);
      }
    };

    loadDependencies();

    // Set a timeout as a fallback
    const timer = setTimeout(() => {
      if (!leafletLoadedRef.current) {
        console.error("Map loading timed out");
        setMapError(true);
      }
    }, 15000); // Increased timeout period

    return () => clearTimeout(timer);
  }, []);

  // Apply filters
  useEffect(() => {
    const filtered = reports.filter((report) => {
      const statusMatch =
        (report.status === "PENDING" && filters.pending) ||
        (report.status === "IN_PROGRESS" && filters.in_progress) ||
        (report.status === "RESOLVED" && filters.resolved);

      const severityMatch =
        (report.severity === "LOW" && filters.low) ||
        (report.severity === "MEDIUM" && filters.medium) ||
        (report.severity === "HIGH" && filters.high);

      return statusMatch && severityMatch;
    });

    setFilteredReports(filtered);
  }, [filters, reports]);

  // Handle filter change
  const handleFilterChange = (key: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle report selection
  const handleReportSelect = (report: Report) => {
    setSelectedReport(report);

    // If on mobile and in list view, switch to map view to see the marker
    if (isMobile && view === "list") {
      setView("map");
    }

    // Center map on selected report
    if (
      mapRef.current &&
      report.latitude !== undefined &&
      report.longitude !== undefined
    ) {
      mapRef.current.flyTo([report.latitude, report.longitude], 16);
    }
  };

  // Close report details
  const handleCloseDetails = () => {
    setSelectedReport(null);
  };

  // Filter UI - different for mobile and desktop
  const FilterUI = () => (
    <div className="space-y-4">
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
              id="low"
              checked={filters.low}
              onCheckedChange={() => handleFilterChange("low")}
            />
            <Label htmlFor="low" className="font-normal">
              Leve
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="medium"
              checked={filters.medium}
              onCheckedChange={() => handleFilterChange("medium")}
            />
            <Label htmlFor="medium" className="font-normal">
              Moderado
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="high"
              checked={filters.high}
              onCheckedChange={() => handleFilterChange("high")}
            />
            <Label htmlFor="high" className="font-normal">
              Grave
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  // Render map or fallback
  const renderMap = () => {
    if (mapError) {
      return (
        <FallbackMap
          reports={filteredReports}
          onReportSelect={handleReportSelect}
        />
      );
    }

    if (!mapLoaded) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary mx-auto"></div>
            <p className="text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      );
    }

    return (
      <PublicMapComponent
        reports={filteredReports}
        onReportSelect={handleReportSelect}
        selectedReport={selectedReport}
        mapRef={mapRef}
      />
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h1 className="text-xl font-bold md:text-2xl">
          Mapa Público de Baches
        </h1>
        <div className="flex gap-2">
          {isMobile ? (
            <>
              {/* Mobile view switcher */}
              <Tabs
                value={view}
                onValueChange={(v) => setView(v as "map" | "list")}
                className="w-[180px]"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="map">
                    <MapIcon className="mr-2 h-4 w-4" />
                    Mapa
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="mr-2 h-4 w-4" />
                    Lista
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Mobile filters drawer */}
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-medium">Filtros</h3>
                    </div>
                    <FilterUI />
                  </div>
                </DrawerContent>
              </Drawer>
            </>
          ) : (
            <>
              {/* Desktop filters popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <FilterUI />
                </PopoverContent>
              </Popover>

              {/* Desktop layers button */}
              <Button variant="outline" className="gap-2">
                <Layers className="h-4 w-4" />
                Capas
              </Button>

              {/* Desktop info button */}
              <Button variant="outline" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex flex-1">
        {/* Mobile views */}
        {isMobile && (
          <>
            <div
              className={`h-full w-full ${view === "map" ? "block" : "hidden"}`}
            >
              {renderMap()}
            </div>
            <div
              className={`h-full w-full ${
                view === "list" ? "block" : "hidden"
              }`}
            >
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h2 className="mb-4 text-lg font-semibold">
                    Reportes ({filteredReports.length})
                  </h2>
                  <div className="space-y-3">
                    {filteredReports.map((report) => (
                      <ReportListItem
                        key={report.id}
                        report={report}
                        onClick={() => handleReportSelect(report)}
                        isSelected={selectedReport?.id === report.id}
                      />
                    ))}
                    {filteredReports.length === 0 && (
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <h3 className="mb-1 text-lg font-medium">
                          No hay reportes
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          No se encontraron reportes con los filtros
                          seleccionados.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Desktop view */}
        {!isMobile && (
          <>
            <div className="h-full w-full">{renderMap()}</div>
            {!mapError && (
              <div className="absolute bottom-4 right-4 z-10">
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
            )}
          </>
        )}

        {/* Report details - different UI for mobile and desktop */}
        {selectedReport && (
          <>
            {isMobile ? (
              <Sheet
                open={!!selectedReport}
                onOpenChange={(open) => !open && setSelectedReport(null)}
              >
                <SheetContent side="bottom" className="h-[80vh] p-0">
                  <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b p-3">
                      {/* Add SheetTitle for accessibility */}
                      <SheetTitle className="text-lg font-semibold">
                        Detalles del Reporte
                      </SheetTitle>
                      {/* Add SheetDescription for accessibility, can be visually hidden */}
                      <SheetDescription className="sr-only">
                        Información detallada sobre el reporte seleccionado
                      </SheetDescription>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCloseDetails}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <ScrollArea className="flex-1">
                      <ReportDetailView report={selectedReport} />
                    </ScrollArea>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <div className="absolute bottom-4 left-4 z-10 w-96">
                <Card>
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between border-b p-3">
                      <h3 className="text-lg font-semibold">
                        Detalles del Reporte
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCloseDetails}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                      <ReportDetailView report={selectedReport} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
