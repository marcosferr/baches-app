"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  ArrowRight 
} from "lucide-react";
import { ReportTimeline } from "@/types";
import { ApiService } from "@/lib/api-service";

interface ReportTimelineProps {
  reportId: string;
}

export default function ReportTimelineView({ reportId }: ReportTimelineProps) {
  const [timeline, setTimeline] = useState<ReportTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getReportTimeline(reportId);
        setTimeline(data);
      } catch (err) {
        console.error("Error fetching timeline:", err);
        setError("No se pudo cargar el historial del reporte");
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [reportId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <Clock className="h-5 w-5 text-gray-500" />;
      case "PENDING":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "IN_PROGRESS":
        return <Loader2 className="h-5 w-5 text-blue-500" />;
      case "RESOLVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "Enviado";
      case "PENDING":
        return "Pendiente";
      case "IN_PROGRESS":
        return "En Progreso";
      case "RESOLVED":
        return "Resuelto";
      case "REJECTED":
        return "Rechazado";
      default:
        return status;
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

  if (timeline.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>No hay historial disponible para este reporte</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Historial del Reporte</h3>
      <div className="space-y-4">
        {timeline.map((entry, index) => (
          <div key={entry.id} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon(entry.newStatus)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                {entry.previousStatus && (
                  <>
                    <span className="text-sm font-medium">
                      {getStatusText(entry.previousStatus)}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </>
                )}
                <span className="text-sm font-medium">
                  {getStatusText(entry.newStatus)}
                </span>
              </div>
              {entry.notes && (
                <p className="text-sm text-muted-foreground">{entry.notes}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {format(new Date(entry.createdAt), "dd MMM yyyy, HH:mm", {
                    locale: es,
                  })}
                </span>
                {entry.changedBy && (
                  <span>por {entry.changedBy.name}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
