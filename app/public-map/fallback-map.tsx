"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Report } from "@/types";

interface FallbackMapProps {
  reports: Report[];
  onReportSelect: (report: Report) => void;
  isLoading?: boolean;
  hasMoreReports?: boolean;
  onLoadMore?: () => void;
  loadedCount?: number;
  totalCount?: number;
}

export function FallbackMap({
  reports,
  onReportSelect,
  isLoading = false,
  hasMoreReports = false,
  onLoadMore,
  loadedCount = 0,
  totalCount = 0,
}: FallbackMapProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-muted/20">
      <div className="mb-4 text-center">
        <MapPin className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">No se pudo cargar el mapa</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Hubo un problema al cargar el mapa interactivo. Por favor, intenta
          recargar la página.
        </p>
        <Button onClick={() => window.location.reload()}>
          Recargar página
        </Button>
      </div>

      <div className="mt-8 w-full max-w-md">
        <h4 className="mb-2 text-center text-sm font-medium">
          Reportes disponibles ({reports.length})
        </h4>
        <div className="max-h-[300px] overflow-y-auto rounded-lg border bg-background p-2">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="loading-spinner mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Cargando reportes...
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="mb-2 cursor-pointer rounded-md border p-2 hover:bg-muted/50"
                onClick={() => onReportSelect(report)}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 overflow-hidden rounded-md">
                    <img
                      src={report.picture || "/placeholder.svg"}
                      alt="Bache"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {report.address ||
                        `${report.latitude.toFixed(
                          6
                        )}, ${report.longitude.toFixed(6)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.status === "pending"
                        ? "Pendiente"
                        : report.status === "in_progress"
                        ? "En proceso"
                        : "Resuelto"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}

          {!isLoading && reports.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No hay reportes disponibles
            </div>
          )}

          {/* Load more button */}
          {hasMoreReports && !isLoading && (
            <div className="mt-4 flex justify-center p-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                    Cargar más reportes ({loadedCount} de {totalCount})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
