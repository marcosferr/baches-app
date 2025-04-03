"use client"

import { useState } from "react"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  Eye,
  CheckSquare,
  XCircle,
  MoreHorizontal,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ReportDetails } from "./report-details"

// Datos de ejemplo
const mockReports = [
  {
    id: "1",
    address: "Av. Independencia 1234",
    reportDate: "2023-10-15",
    status: "pending",
    severity: "moderate",
    reporter: "Juan Pérez",
    image: "/placeholder.svg?height=300&width=400",
    description: "Bache de tamaño mediano en el carril derecho",
  },
  {
    id: "2",
    address: "Calle San Martín 567",
    reportDate: "2023-10-10",
    status: "in_progress",
    severity: "severe",
    reporter: "María González",
    image: "/placeholder.svg?height=300&width=400",
    description: "Bache grande que ocupa todo el ancho de la calle",
  },
  {
    id: "3",
    address: "Ruta 1 km 23",
    reportDate: "2023-09-28",
    status: "resolved",
    severity: "minor",
    reporter: "Carlos Rodríguez",
    image: "/placeholder.svg?height=300&width=400",
    description: "Pequeño bache en la banquina",
  },
  {
    id: "4",
    address: "Av. Libertad 890",
    reportDate: "2023-10-14",
    status: "pending",
    severity: "severe",
    reporter: "Ana López",
    image: "/placeholder.svg?height=300&width=400",
    description: "Bache profundo que puede dañar vehículos",
  },
  {
    id: "5",
    address: "Calle 9 de Julio 432",
    reportDate: "2023-10-08",
    status: "in_progress",
    severity: "moderate",
    reporter: "Pedro Sánchez",
    image: "/placeholder.svg?height=300&width=400",
    description: "Bache en la intersección que dificulta el tránsito",
  },
]

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState<(typeof mockReports)[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporter.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && report.status === "pending") ||
      (activeTab === "in_progress" && report.status === "in_progress") ||
      (activeTab === "resolved" && report.status === "resolved")

    return matchesSearch && matchesTab
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-orange-500">Pendiente</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500">En Proceso</Badge>
      case "resolved":
        return <Badge className="bg-green-500">Resuelto</Badge>
      default:
        return null
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "minor":
        return (
          <Badge variant="outline" className="border-yellow-300 text-yellow-600 dark:text-yellow-400">
            Leve
          </Badge>
        )
      case "moderate":
        return (
          <Badge variant="outline" className="border-orange-300 text-orange-600 dark:text-orange-400">
            Moderado
          </Badge>
        )
      case "severe":
        return (
          <Badge variant="outline" className="border-red-300 text-red-600 dark:text-red-400">
            Grave
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Reportes</h1>
          <p className="text-muted-foreground">Administra y actualiza el estado de los reportes de baches</p>
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
            <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-1 md:grid-rows-4">
                <TabsTrigger value="all" className="justify-start">
                  Todos
                  <Badge variant="secondary" className="ml-auto">
                    {mockReports.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending" className="justify-start">
                  <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                  Pendientes
                  <Badge variant="secondary" className="ml-auto">
                    {mockReports.filter((r) => r.status === "pending").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="justify-start">
                  <Clock className="mr-2 h-4 w-4 text-blue-500" />
                  En Proceso
                  <Badge variant="secondary" className="ml-auto">
                    {mockReports.filter((r) => r.status === "in_progress").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="resolved" className="justify-start">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Resueltos
                  <Badge variant="secondary" className="ml-auto">
                    {mockReports.filter((r) => r.status === "resolved").length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
                  <TableHead>Reportante</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.address}</TableCell>
                    <TableCell>{report.reportDate}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                    <TableCell>{report.reporter}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedReport(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <CheckSquare className="h-4 w-4" />
                              <span>Aprobar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Marcar en proceso</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Marcar como resuelto</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span>Rechazar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {selectedReport && (
        <ReportDetails
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusChange={(status) => {
            // En un caso real, aquí actualizaríamos el estado en la base de datos
            console.log(`Cambiando estado de reporte ${selectedReport.id} a ${status}`)
            setSelectedReport(null)
          }}
        />
      )}
    </div>
  )
}

