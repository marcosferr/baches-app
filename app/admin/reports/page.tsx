"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  Eye,
  MoreHorizontal,
  XCircle,
  FileText,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportDetails } from "./report-details";
import { ApiService } from "@/lib/api-service";
import { Report } from "@/types";
import { format } from "date-fns";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CSVLink } from "react-csv";
import ReportPDF from "./pdf-document";
import { formatReportsForCSV } from "./export-utils";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);

        const statusFilter =
          activeTab !== "all"
            ? [activeTab as "pending" | "in_progress" | "resolved" | "rejected"]
            : undefined;

        const fetchedReports = await ApiService.getReports({
          status: statusFilter,
        });

        setReports(fetchedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [activeTab]);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false ||
      report.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
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

  const getSeverityBadge = (severity: string) => {
    const normalizedSeverity = severity.toLowerCase();
    switch (normalizedSeverity) {
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

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      const normalizedStatus = newStatus.toUpperCase();
      const updatedReport = await ApiService.updateReportStatus(
        reportId,
        normalizedStatus
      );

      // Update reports list
      setReports(
        reports.map((report) =>
          report.id === reportId
            ? { ...report, status: normalizedStatus }
            : report
        )
      );

      setSelectedReport(null);
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const pendingCount = reports.filter(
    (r) => r.status?.toLowerCase() === "pending"
  ).length;
  const inProgressCount = reports.filter(
    (r) => r.status?.toLowerCase() === "in_progress"
  ).length;
  const resolvedCount = reports.filter(
    (r) => r.status?.toLowerCase() === "resolved"
  ).length;
  const rejectedCount = reports.filter(
    (r) => r.status?.toLowerCase() === "rejected"
  ).length;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Reportes</h1>
          <p className="text-muted-foreground">
            Administra y actualiza el estado de los reportes de baches
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <PDFDownloadLink
                document={<ReportPDF reports={filteredReports} />}
                fileName={`reportes-baches-${format(
                  new Date(),
                  "yyyy-MM-dd"
                )}.pdf`}
              >
                {({ loading }) => (
                  <DropdownMenuItem disabled={loading}>
                    <FileText className="mr-2 h-4 w-4" />
                    {loading ? "Generando PDF..." : "Exportar a PDF"}
                  </DropdownMenuItem>
                )}
              </PDFDownloadLink>

              <CSVLink
                data={formatReportsForCSV(filteredReports).data}
                headers={formatReportsForCSV(filteredReports).headers}
                filename={`reportes-baches-${format(
                  new Date(),
                  "yyyy-MM-dd"
                )}.csv`}
                className="w-full"
              >
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar a CSV
                </DropdownMenuItem>
              </CSVLink>

              <DropdownMenuItem asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() =>
                    (window.location.href = "/admin/reports/export")
                  }
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Opciones avanzadas
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por dirección o reportante..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="all"
              className="w-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="flex flex-col w-full space-y-2 h-auto">
                <TabsTrigger value="all" className="justify-between w-full">
                  <span>Todos</span>
                  <Badge variant="secondary">{reports.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pending" className="justify-between w-full">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                    <span>Pendientes</span>
                  </div>
                  <Badge variant="secondary">{pendingCount}</Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="in_progress"
                  className="justify-between w-full"
                >
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    <span>En Proceso</span>
                  </div>
                  <Badge variant="secondary">{inProgressCount}</Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="resolved"
                  className="justify-between w-full"
                >
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Resueltos</span>
                  </div>
                  <Badge variant="secondary">{resolvedCount}</Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="justify-between w-full"
                >
                  <div className="flex items-center">
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    <span>Rechazados</span>
                  </div>
                  <Badge variant="secondary">{rejectedCount}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <p>Cargando reportes...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="flex justify-center items-center p-8">
                <p>No se encontraron reportes</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Gravedad</TableHead>
                    <TableHead>Reportante</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.address || "Sin dirección"}
                      </TableCell>
                      <TableCell>{formatDate(report.createdAt)}</TableCell>
                      <TableCell>
                        {getStatusBadge(report.status || "")}
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(report.severity || "")}
                      </TableCell>
                      <TableCell>{report.author?.name || "Anónimo"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {report.status?.toLowerCase() !==
                                "in_progress" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(report.id, "in_progress")
                                  }
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  <span>Marcar en proceso</span>
                                </DropdownMenuItem>
                              )}
                              {report.status?.toLowerCase() !== "resolved" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(report.id, "resolved")
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Marcar como resuelto</span>
                                </DropdownMenuItem>
                              )}
                              {report.status?.toLowerCase() !== "rejected" && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    handleStatusChange(report.id, "rejected")
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  <span>Rechazar</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedReport && (
        <ReportDetails
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusChange={(status) =>
            handleStatusChange(selectedReport.id, status)
          }
        />
      )}
    </div>
  );
}
