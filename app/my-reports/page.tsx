"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  ChevronDown,
  Eye,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BacheDetails } from "../map/bache-details";
import { ProtectedRoute } from "@/components/protected-route";
import { getUserReports } from "@/lib/actions/report-actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Report } from "@prisma/client";

// Format date function
const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString("es-PY", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function MyReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<
    Array<Report & { _count?: { comments: number } }>
  >([]);
  const [selectedReport, setSelectedReport] = useState<
    (typeof reports)[0] | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreReports, setHasMoreReports] = useState(true);
  const [totalReports, setTotalReports] = useState(0);
  const pageSize = 20; // Number of reports per page

  // Fetch user reports on component mount or when tab changes
  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setReports([]); // Clear reports when first loading
        setCurrentPage(1); // Reset to first page

        const response = await getUserReports(1, pageSize);
        setReports(response.reports);
        setTotalReports(response.pagination.total);
        setHasMoreReports(response.pagination.page < response.pagination.pages);
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Error",
          description:
            "No se pudieron cargar tus reportes. Por favor intenta nuevamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [toast, pageSize, activeTab]);

  // Function to load more reports
  const loadMoreReports = async () => {
    if (!hasMoreReports || loading) return;

    const nextPage = currentPage + 1;
    setLoading(true);

    try {
      const response = await getUserReports(nextPage, pageSize);

      // Append new reports to existing ones
      setReports((prevReports) => [...prevReports, ...response.reports]);
      setCurrentPage(nextPage);
      setHasMoreReports(nextPage < response.pagination.pages);
    } catch (error) {
      console.error("Error loading more reports:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar más reportes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on search query and active tab
  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.address
      ? report.address.toLowerCase().includes(searchQuery.toLowerCase())
      : `${report.latitude}, ${report.longitude}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && report.status === "PENDING") ||
      (activeTab === "in_progress" && report.status === "IN_PROGRESS") ||
      (activeTab === "resolved" && report.status === "RESOLVED");

    return matchesSearch && matchesTab;
  });

  // Count reports by status
  const pendingCount = reports.filter((r) => r.status === "PENDING").length;
  const inProgressCount = reports.filter(
    (r) => r.status === "IN_PROGRESS"
  ).length;
  const resolvedCount = reports.filter((r) => r.status === "RESOLVED").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <Badge className="bg-yellow-500">Enviado</Badge>;
      case "PENDING":
        return <Badge className="bg-orange-500">Pendiente</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500">En Proceso</Badge>;
      case "RESOLVED":
        return <Badge className="bg-green-500">Resuelto</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500">Rechazado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "LOW":
        return (
          <Badge
            variant="outline"
            className="border-yellow-300 text-yellow-600 dark:text-yellow-400"
          >
            Leve
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge
            variant="outline"
            className="border-orange-300 text-orange-600 dark:text-orange-400"
          >
            Moderado
          </Badge>
        );
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
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <ProtectedRoute allowedRoles={["citizen", "admin"]}>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Mis Reportes</h1>
            <p className="text-muted-foreground">
              Visualiza y haz seguimiento de tus reportes de baches
            </p>
          </div>
          <Button asChild className="gap-2">
            <a href="/report">
              <AlertTriangle className="h-4 w-4" />
              Reportar Nuevo Bache
            </a>
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por dirección..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Filtrar por Fecha
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant={activeTab === "all" ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => setActiveTab("all")}
                >
                  <span>Todos</span>
                  <Badge variant="secondary">{totalReports}</Badge>
                </Button>

                <Button
                  variant={activeTab === "pending" ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => setActiveTab("pending")}
                >
                  <span className="flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                    Pendientes
                  </span>
                  <Badge variant="secondary">{pendingCount}</Badge>
                </Button>

                <Button
                  variant={activeTab === "in_progress" ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => setActiveTab("in_progress")}
                >
                  <span className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    En Proceso
                  </span>
                  <Badge variant="secondary">{inProgressCount}</Badge>
                </Button>

                <Button
                  variant={activeTab === "resolved" ? "default" : "outline"}
                  className="w-full justify-between"
                  onClick={() => setActiveTab("resolved")}
                >
                  <span className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Resueltos
                  </span>
                  <Badge variant="secondary">{resolvedCount}</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Gravedad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Show skeleton loaders when loading
                    Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {report.address ||
                            `${report.latitude.toFixed(
                              4
                            )}, ${report.longitude.toFixed(4)}`}
                        </TableCell>
                        <TableCell>{formatDate(report.createdAt)}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          {getSeverityBadge(report.severity)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron reportes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Load more button */}
              {hasMoreReports && !loading && (
                <div className="mt-4 flex justify-center p-4">
                  <Button
                    variant="outline"
                    onClick={loadMoreReports}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                        Cargando...
                      </>
                    ) : (
                      <>
                        Cargar más reportes ({reports.length} de {totalReports})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {selectedReport && (
          <BacheDetails
            bache={selectedReport}
            onClose={() => setSelectedReport(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
