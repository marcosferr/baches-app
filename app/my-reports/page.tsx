"use client"

import { useState } from "react"
import { CheckCircle, Clock, AlertTriangle, Search, ChevronDown, Eye, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// No need for Tabs components anymore
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BacheDetails } from "../map/bache-details"

// Datos de ejemplo
const mockReports = [
  {
    id: "1",
    address: "Av. Independencia 1234",
    reportDate: "2023-10-15",
    status: "pending",
    severity: "moderate",
    description: "Bache de tamaño mediano en el carril derecho",
    image: "/placeholder.svg?height=300&width=400",
    reporter: "Juan Pérez",
  },
  {
    id: "2",
    address: "Calle San Martín 567",
    reportDate: "2023-10-10",
    status: "in_progress",
    severity: "severe",
    description: "Bache grande que ocupa todo el ancho de la calle",
    image: "/placeholder.svg?height=300&width=400",
    reporter: "Juan Pérez",
  },
  {
    id: "3",
    address: "Ruta 1 km 23",
    reportDate: "2023-09-28",
    status: "resolved",
    severity: "minor",
    description: "Pequeño bache en la banquina",
    image: "/placeholder.svg?height=300&width=400",
    reporter: "Juan Pérez",
  },
]

export default function MyReportsPage() {
  const [selectedReport, setSelectedReport] = useState<(typeof mockReports)[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch = report.address.toLowerCase().includes(searchQuery.toLowerCase())

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
          <h1 className="text-3xl font-bold">Mis Reportes</h1>
          <p className="text-muted-foreground">Visualiza y haz seguimiento de tus reportes de baches</p>
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
                <Badge variant="secondary">{mockReports.length}</Badge>
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
                <Badge variant="secondary">{mockReports.filter((r) => r.status === "pending").length}</Badge>
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
                <Badge variant="secondary">{mockReports.filter((r) => r.status === "in_progress").length}</Badge>
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
                <Badge variant="secondary">{mockReports.filter((r) => r.status === "resolved").length}</Badge>
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
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.address}</TableCell>
                    <TableCell>{report.reportDate}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedReport(report)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {selectedReport && <BacheDetails bache={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  )
}

