"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  ArrowLeft,
  Calendar,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiService } from "@/lib/api-service";
import { Report } from "@/types";
import { format } from "date-fns";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CSVLink } from "react-csv";
import ReportPDF from "../pdf-document";
import { formatReportsForCSV } from "../export-utils";
import { DatePicker } from "@/components/ui/date-picker";

export default function ExportReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [includeComments, setIncludeComments] = useState(true);
  
  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const fetchedReports = await ApiService.getReports();
        setReports(fetchedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    // Filter by status if any status is selected
    if (statusFilter.length > 0 && !statusFilter.includes(report.status?.toLowerCase() || '')) {
      return false;
    }
    
    // Filter by severity if any severity is selected
    if (severityFilter.length > 0 && !severityFilter.includes(report.severity?.toLowerCase() || '')) {
      return false;
    }
    
    // Filter by date range
    if (startDate) {
      const reportDate = new Date(report.createdAt);
      if (reportDate < startDate) {
        return false;
      }
    }
    
    if (endDate) {
      const reportDate = new Date(report.createdAt);
      // Set end date to end of day
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (reportDate > endOfDay) {
        return false;
      }
    }
    
    return true;
  });

  const handleStatusToggle = (status: string) => {
    setStatusFilter((prev) => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const handleSeverityToggle = (severity: string) => {
    setSeverityFilter((prev) => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity) 
        : [...prev, severity]
    );
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setSeverityFilter([]);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Exportar Reportes</h1>
            <p className="text-muted-foreground">
              Genera reportes en PDF o CSV con los datos filtrados
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Estado</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="status-submitted" 
                    checked={statusFilter.includes('submitted')}
                    onCheckedChange={() => handleStatusToggle('submitted')}
                  />
                  <Label htmlFor="status-submitted">Enviado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="status-pending" 
                    checked={statusFilter.includes('pending')}
                    onCheckedChange={() => handleStatusToggle('pending')}
                  />
                  <Label htmlFor="status-pending">Pendiente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="status-in_progress" 
                    checked={statusFilter.includes('in_progress')}
                    onCheckedChange={() => handleStatusToggle('in_progress')}
                  />
                  <Label htmlFor="status-in_progress">En Proceso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="status-resolved" 
                    checked={statusFilter.includes('resolved')}
                    onCheckedChange={() => handleStatusToggle('resolved')}
                  />
                  <Label htmlFor="status-resolved">Resuelto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="status-rejected" 
                    checked={statusFilter.includes('rejected')}
                    onCheckedChange={() => handleStatusToggle('rejected')}
                  />
                  <Label htmlFor="status-rejected">Rechazado</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Gravedad</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="severity-low" 
                    checked={severityFilter.includes('low')}
                    onCheckedChange={() => handleSeverityToggle('low')}
                  />
                  <Label htmlFor="severity-low">Leve</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="severity-medium" 
                    checked={severityFilter.includes('medium')}
                    onCheckedChange={() => handleSeverityToggle('medium')}
                  />
                  <Label htmlFor="severity-medium">Moderado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="severity-high" 
                    checked={severityFilter.includes('high')}
                    onCheckedChange={() => handleSeverityToggle('high')}
                  />
                  <Label htmlFor="severity-high">Grave</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Rango de Fechas</h3>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="start-date">Desde</Label>
                  <DatePicker
                    id="start-date"
                    selected={startDate}
                    onSelect={setStartDate}
                    placeholder="Seleccionar fecha inicial"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="end-date">Hasta</Label>
                  <DatePicker
                    id="end-date"
                    selected={endDate}
                    onSelect={setEndDate}
                    placeholder="Seleccionar fecha final"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Opciones de Exportación</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-comments" 
                    checked={includeComments}
                    onCheckedChange={(checked) => setIncludeComments(!!checked)}
                  />
                  <Label htmlFor="include-comments">Incluir comentarios</Label>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={clearFilters}
            >
              Limpiar Filtros
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <p>Cargando reportes...</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-muted-foreground">
                    {filteredReports.length} reportes encontrados
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                          <FileText className="h-12 w-12 text-primary" />
                          <div>
                            <h3 className="text-lg font-medium">Exportar a PDF</h3>
                            <p className="text-sm text-muted-foreground">
                              Genera un documento PDF con todos los detalles de los reportes
                            </p>
                          </div>
                          <PDFDownloadLink
                            document={<ReportPDF reports={filteredReports} showComments={includeComments} />}
                            fileName={`reportes-baches-${format(new Date(), "yyyy-MM-dd")}.pdf`}
                            className="w-full"
                          >
                            {({ loading, error }) => (
                              <Button 
                                className="w-full gap-2" 
                                disabled={loading || filteredReports.length === 0}
                              >
                                <Download className="h-4 w-4" />
                                {loading ? "Generando PDF..." : "Descargar PDF"}
                              </Button>
                            )}
                          </PDFDownloadLink>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                          <FileText className="h-12 w-12 text-primary" />
                          <div>
                            <h3 className="text-lg font-medium">Exportar a CSV</h3>
                            <p className="text-sm text-muted-foreground">
                              Genera un archivo CSV para análisis en Excel u otras herramientas
                            </p>
                          </div>
                          <CSVLink
                            data={formatReportsForCSV(filteredReports).data}
                            headers={formatReportsForCSV(filteredReports).headers}
                            filename={`reportes-baches-${format(new Date(), "yyyy-MM-dd")}.csv`}
                            className="w-full"
                          >
                            <Button 
                              className="w-full gap-2"
                              disabled={filteredReports.length === 0}
                            >
                              <Download className="h-4 w-4" />
                              Descargar CSV
                            </Button>
                          </CSVLink>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="rounded-md border">
                    <div className="p-4">
                      <h3 className="font-medium">Reportes incluidos ({filteredReports.length})</h3>
                    </div>
                    <div className="max-h-96 overflow-auto">
                      {filteredReports.length > 0 ? (
                        <table className="w-full">
                          <thead className="sticky top-0 bg-background">
                            <tr className="border-b">
                              <th className="p-3 text-left font-medium">Dirección</th>
                              <th className="p-3 text-left font-medium">Estado</th>
                              <th className="p-3 text-left font-medium">Gravedad</th>
                              <th className="p-3 text-left font-medium">Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredReports.map((report) => (
                              <tr key={report.id} className="border-b">
                                <td className="p-3">{report.address || "Sin dirección"}</td>
                                <td className="p-3">{report.status}</td>
                                <td className="p-3">{report.severity}</td>
                                <td className="p-3">{format(new Date(report.createdAt), "dd/MM/yyyy")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-muted-foreground">No hay reportes que coincidan con los filtros seleccionados</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
