import {
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Report } from "@/types";

interface ReportDetailViewProps {
  report: Report;
}

export function ReportDetailView({ report }: ReportDetailViewProps) {
  // Format date
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "Fecha desconocida";

    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    return new Intl.DateTimeFormat("es-PY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = () => {
    const status =
      typeof report.status === "string"
        ? report.status.toLowerCase()
        : report.status;

    switch (status) {
      case "pending":
      case "PENDING":
        return <Badge className="bg-orange-500">Pendiente</Badge>;
      case "in_progress":
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500">En Proceso</Badge>;
      case "resolved":
      case "RESOLVED":
        return <Badge className="bg-green-500">Resuelto</Badge>;
      case "rejected":
      case "REJECTED":
        return <Badge className="bg-red-500">Rechazado</Badge>;
      default:
        return null;
    }
  };

  // Get severity badge
  const getSeverityBadge = () => {
    const severity =
      typeof report.severity === "string"
        ? report.severity.toLowerCase()
        : report.severity;

    switch (severity) {
      case "low":
      case "LOW":
        return (
          <Badge
            variant="outline"
            className="border-yellow-300 text-yellow-600 dark:text-yellow-400"
          >
            Leve
          </Badge>
        );
      case "medium":
      case "MEDIUM":
        return (
          <Badge
            variant="outline"
            className="border-orange-300 text-orange-600 dark:text-orange-400"
          >
            Moderado
          </Badge>
        );
      case "high":
      case "HIGH":
        return (
          <Badge
            variant="outline"
            className="border-red-300 text-red-600 dark:text-red-400"
          >
            Grave
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 aspect-video w-full overflow-hidden rounded-md">
        <img
          src={report.picture || "/placeholder.svg"}
          alt="Imagen del bache"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {getStatusBadge()}
        {getSeverityBadge()}
      </div>

      <div className="pb-2 pt-4 border-t">
        <h3 className="font-semibold">Ubicación</h3>
        <p className="text-sm text-muted-foreground">
          {report.address ||
            `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`}
        </p>
      </div>

      <div className="mb-4 space-y-2">
        <h3 className="font-semibold">Descripción</h3>
        <p className="text-sm text-muted-foreground">{report.description}</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Reportado el {formatDate(report.createdAt || report.date_created)}
          </span>
        </div>

        {report.comments && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{report.comments.length} comentarios</span>
          </div>
        )}
      </div>

      {(report.status === "in_progress" || report.status === "IN_PROGRESS") && (
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">En proceso de reparación</span>
          </div>
          <p className="mt-1">
            Este bache está siendo reparado por las autoridades.
          </p>
        </div>
      )}

      {(report.status === "resolved" || report.status === "RESOLVED") && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Reparado</span>
          </div>
          <p className="mt-1">
            Este bache ha sido reparado satisfactoriamente.
          </p>
        </div>
      )}

      {(report.status === "pending" || report.status === "PENDING") && (
        <div className="rounded-md bg-orange-50 p-3 text-sm text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Pendiente de revisión</span>
          </div>
          <p className="mt-1">
            Este reporte está pendiente de revisión por las autoridades.
          </p>
        </div>
      )}

      {(report.status === "rejected" || report.status === "REJECTED") && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Reporte rechazado</span>
          </div>
          <p className="mt-1">
            Este reporte ha sido rechazado por las autoridades.
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Link href={`/reports/${report.id}`}>
          <Button>
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Reporte Completo
          </Button>
        </Link>
      </div>
    </div>
  );
}
