import { Badge } from "@/components/ui/badge";

interface ReportStatusBadgeProps {
  status: string;
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
        >
          Pendiente
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
        >
          En proceso
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
        >
          Resuelto
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          Rechazado
        </Badge>
      );
    default:
      return <Badge variant="outline">Estado desconocido</Badge>;
  }
}
