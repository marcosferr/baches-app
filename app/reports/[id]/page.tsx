"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  AlertTriangle,
  MapPin,
  Clock,
  User,
  ArrowLeft,
  Loader2,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CommentList } from "@/components/comments/comment-list";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { ApiService } from "@/lib/api-service";
import { useToast } from "@/hooks/use-toast";

export default function ReportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [report, setReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const reportData = await ApiService.getReportById(params.id);
        setReport(reportData);
      } catch (error) {
        console.error("Error fetching report:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el reporte solicitado.",
          variant: "destructive",
        });
        router.push("/reports");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [params.id, router, toast]);

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "LOW":
        return "Leve";
      case "MEDIUM":
        return "Moderado";
      case "HIGH":
        return "Grave";
      default:
        return "Desconocido";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "LOW":
        return "bg-yellow-500";
      case "MEDIUM":
        return "bg-orange-500";
      case "HIGH":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
            <h2 className="text-xl font-semibold">Reporte no encontrado</h2>
            <p className="mt-2 text-muted-foreground">
              El reporte que estás buscando no existe o no tienes permisos para
              verlo.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => router.push("/reports")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a reportes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => router.push("/reports")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a reportes
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    Reporte de bache {report.id.substring(0, 8)}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Reportado el{" "}
                        {format(
                          new Date(report.createdAt),
                          "dd/MM/yyyy 'a las' HH:mm"
                        )}
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <ReportStatusBadge status={report.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold">Foto del bache</h3>
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src={report.picture}
                    alt="Foto del bache"
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Descripción</h3>
                <p className="text-muted-foreground">{report.description}</p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Detalles</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-muted p-3">
                    <div className="mb-1 text-sm font-medium">Gravedad</div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${getSeverityColor(
                          report.severity
                        )}`}
                      ></div>
                      <span>{getSeverityLabel(report.severity)}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <div className="mb-1 text-sm font-medium">
                      Reportado por
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{report.author?.name || "Usuario anónimo"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Ubicación</h3>
                <div className="rounded-lg bg-muted p-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      {report.address ? (
                        <span>{report.address}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          Sin dirección específica
                        </span>
                      )}
                      <div className="mt-1 text-xs text-muted-foreground">
                        Latitud: {report.latitude.toFixed(6)}, Longitud:{" "}
                        {report.longitude.toFixed(6)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <CommentList
                reportId={report.id}
                reportAuthorId={report.authorId}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Estado del reporte</CardTitle>
              <CardDescription>Seguimiento del bache reportado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Reporte enviado</div>
                    <div className="text-sm text-muted-foreground">
                      {format(
                        new Date(report.createdAt),
                        "dd/MM/yyyy 'a las' HH:mm"
                      )}
                    </div>
                  </div>
                </div>

                <div className="ml-4 border-l pl-7 pt-2">
                  <div
                    className={`-ml-11 flex items-center gap-3 ${
                      ["IN_PROGRESS", "RESOLVED"].includes(report.status)
                        ? ""
                        : "opacity-50"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 flex-shrink-0 rounded-full ${
                        ["IN_PROGRESS", "RESOLVED"].includes(report.status)
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      } flex items-center justify-center`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">En proceso</div>
                      <div className="text-sm text-muted-foreground">
                        {report.status === "IN_PROGRESS"
                          ? "El reporte está siendo atendido"
                          : report.status === "RESOLVED"
                          ? "El reporte fue procesado"
                          : "Esperando revisión"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-4 border-l pl-7 pt-2">
                  <div
                    className={`-ml-11 flex items-center gap-3 ${
                      report.status === "RESOLVED" ? "" : "opacity-50"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 flex-shrink-0 rounded-full ${
                        report.status === "RESOLVED"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      } flex items-center justify-center`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                        <path d="M7.5 12.5L10.5 15.5L16 10"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Resuelto</div>
                      <div className="text-sm text-muted-foreground">
                        {report.status === "RESOLVED"
                          ? "El bache ha sido reparado"
                          : "Pendiente de resolución"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {session?.user?.role === "admin" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Acciones administrativas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Cambiar estado</span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={
                        report.status === "PENDING" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        // Handle status change
                      }}
                    >
                      Pendiente
                    </Button>
                    <Button
                      variant={
                        report.status === "IN_PROGRESS" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        // Handle status change
                      }}
                    >
                      En proceso
                    </Button>
                    <Button
                      variant={
                        report.status === "RESOLVED" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        // Handle status change
                      }}
                    >
                      Resuelto
                    </Button>
                    <Button
                      variant={
                        report.status === "REJECTED" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        // Handle status change
                      }}
                    >
                      Rechazado
                    </Button>
                  </div>
                </div>

                <Separator />

                <Button variant="destructive" className="w-full">
                  Eliminar reporte
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
