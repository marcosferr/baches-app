"use client";
import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import {
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AdminChart } from "./admin-chart";
import { AdminMap } from "./admin-map";
import { ApiService } from "@/lib/api-service";

export default function AdminDashboardPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    byZone: [],
    bySeverity: {
      low: 0,
      medium: 0,
      high: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reportData = await ApiService.getReports();
        setReports(reportData);

        // Calculate stats
        const total = reportData.length;
        const pending = reportData.filter(
          (report) => report.status === "PENDING"
        ).length;
        const inProgress = reportData.filter(
          (report) => report.status === "IN_PROGRESS"
        ).length;
        const resolved = reportData.filter(
          (report) => report.status === "RESOLVED"
        ).length;

        // Count reports by severity
        const low = reportData.filter(
          (report) => report.severity === "LOW"
        ).length;
        const medium = reportData.filter(
          (report) => report.severity === "MEDIUM"
        ).length;
        const high = reportData.filter(
          (report) => report.severity === "HIGH"
        ).length;

        // Calculate reports by zone (simplified)
        // In a real app, you'd group by actual zones based on coordinates
        const zoneData = Array(9)
          .fill(0)
          .map((_, i) => {
            return reportData.filter((report) => report.latitude % 9 === i)
              .length;
          });

        setStats({
          total,
          pending,
          inProgress,
          resolved,
          byZone: zoneData,
          bySeverity: { low, medium, high },
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get recent reports (last 3)
  const recentReports = reports.slice(0, 3);

  // Calculate percentages for severity chart
  const lowPercentage = stats.total
    ? (stats.bySeverity.low / stats.total) * 100
    : 0;
  const mediumPercentage = stats.total
    ? (stats.bySeverity.medium / stats.total) * 100
    : 0;
  const highPercentage = stats.total
    ? (stats.bySeverity.high / stats.total) * 100
    : 0;

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">
              Monitorea y gestiona los reportes de baches en tiempo real
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Exportar Datos</Button>
            <Button>Generar Informe</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Reportes
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                Datos actualizados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.pending}
              </div>
              <p className="text-xs text-muted-foreground">
                Reportes por atender
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.inProgress}
              </div>
              <p className="text-xs text-muted-foreground">
                Reportes en atención
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.resolved}
              </div>
              <p className="text-xs text-muted-foreground">
                Reportes completados
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="statistics" className="mt-6">
          <TabsList>
            <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
            <TabsTrigger value="map">Mapa de Calor</TabsTrigger>
          </TabsList>
          <TabsContent value="statistics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Reportes por Zona</CardTitle>
                <CardDescription>
                  Distribución de reportes de baches por zona geográfica
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <AdminChart data={stats.byZone} loading={loading} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="map" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Calor de Baches</CardTitle>
                <CardDescription>
                  Visualización de la concentración de baches por zona
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full overflow-hidden rounded-md border">
                  <AdminMap reports={reports} loading={loading} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Recientes</CardTitle>
              <CardDescription>
                Últimos reportes de baches recibidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Cargando reportes recientes...</p>
              ) : (
                <div className="space-y-4">
                  {recentReports.length > 0 ? (
                    recentReports.map((report) => (
                      <div key={report.id} className="flex items-center gap-4">
                        <div className="h-12 w-12 overflow-hidden rounded-md">
                          <img
                            src={
                              report.picture ||
                              `/placeholder.svg?height=100&width=100&text=Bache`
                            }
                            alt={`Bache ${report.id}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {report.address || "Dirección no disponible"}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No hay reportes recientes</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reportes por Gravedad</CardTitle>
              <CardDescription>
                Distribución de reportes según su nivel de gravedad
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Cargando datos de gravedad...</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <span>Leve</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {stats.bySeverity.low}
                      </span>
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${lowPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                      <span>Moderado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {stats.bySeverity.medium}
                      </span>
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-orange-500"
                          style={{ width: `${mediumPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span>Grave</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {stats.bySeverity.high}
                      </span>
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${highPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
