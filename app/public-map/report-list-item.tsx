"use client";

import {
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Report } from "@/types";

interface ReportListItemProps {
  report: Report;
  onClick: () => void;
  isSelected?: boolean;
}

export function ReportListItem({
  report,
  onClick,
  isSelected = false,
}: ReportListItemProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-PY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (report.status) {
      case "submitted":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (report.status) {
      case "submitted":
        return <Badge className="bg-yellow-500">Enviado</Badge>;
      case "pending":
        return <Badge className="bg-orange-500">Pendiente</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">En Proceso</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resuelto</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rechazado</Badge>;
      default:
        return null;
    }
  };

  // Get severity badge
  const getSeverityBadge = () => {
    switch (report.severity) {
      case "low":
        return (
          <Badge
            variant="outline"
            className="border-yellow-300 text-yellow-600 dark:text-yellow-400"
          >
            Leve
          </Badge>
        );
      case "medium":
        return (
          <Badge
            variant="outline"
            className="border-orange-300 text-orange-600 dark:text-orange-400"
          >
            Moderado
          </Badge>
        );
      case "high":
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
    <div
      className={cn(
        "cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50",
        isSelected && "border-primary bg-primary/5"
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div className="h-16 w-16 overflow-hidden rounded-md">
          <img
            src={report.picture || "/placeholder.svg"}
            alt="Bache"
            className="h-full w-full object-cover"
            loading="lazy"
            width="64"
            height="64"
          />
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            {getStatusIcon()}
            <p className="font-medium">
              {report.address ||
                `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`}
            </p>
          </div>
          <div className="mb-2 flex flex-wrap gap-2">
            {getStatusBadge()}
            {getSeverityBadge()}
          </div>
          <p className="text-xs text-muted-foreground">
            Reportado el {formatDate(report.createdAt.toString())}
          </p>
        </div>
      </div>
    </div>
  );
}
