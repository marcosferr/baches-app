"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { ApiService } from "@/lib/api-service";
import { ReportTimeMetrics } from "@/types";

export default function ReportAnalytics() {
  const [metrics, setMetrics] = useState<ReportTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getReportAnalytics();
        setMetrics(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("No se pudieron cargar las métricas de reportes");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Format time in milliseconds to a human-readable format
  const formatTime = (milliseconds: number) => {
    if (milliseconds === 0) return "N/A";
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} día${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hora${hours !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else {
      return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>No hay datos de análisis disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Análisis de Tiempos</h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Tiempo Promedio de Resolución
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(metrics.averageResolutionTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              Desde la creación hasta la resolución
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Tiempo Promedio de Aprobación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(metrics.averageTimeToApprove)}
            </div>
            <p className="text-xs text-muted-foreground">
              Desde la creación hasta la aprobación
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Tiempo Promedio en Progreso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(metrics.averageTimeInProgress)}
            </div>
            <p className="text-xs text-muted-foreground">
              Desde en progreso hasta resolución
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Estados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-lg font-bold">{metrics.totalSubmittedCount}</div>
              <div className="text-sm text-muted-foreground">Enviados</div>
            </div>
            <div>
              <div className="text-lg font-bold">{metrics.totalPendingCount}</div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
            </div>
            <div>
              <div className="text-lg font-bold">{metrics.totalInProgressCount}</div>
              <div className="text-sm text-muted-foreground">En Progreso</div>
            </div>
            <div>
              <div className="text-lg font-bold">{metrics.totalResolvedCount}</div>
              <div className="text-sm text-muted-foreground">Resueltos</div>
            </div>
            <div>
              <div className="text-lg font-bold">{metrics.totalRejectedCount}</div>
              <div className="text-sm text-muted-foreground">Rechazados</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
