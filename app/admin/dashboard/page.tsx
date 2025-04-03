"use client"
import { ProtectedRoute } from "@/components/protected-route"
import { MapPin, CheckCircle, Clock, AlertTriangle, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AdminChart } from "./admin-chart"
import { AdminMap } from "./admin-map"

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">Monitorea y gestiona los reportes de baches en tiempo real</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Exportar Datos</Button>
            <Button>Generar Informe</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reportes</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">+5.2% desde el mes pasado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">12 reportes nuevos hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">35</div>
              <p className="text-xs text-muted-foreground">8 actualizados esta semana</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">50</div>
              <p className="text-xs text-muted-foreground">+12.3% desde el mes pasado</p>
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
                <CardDescription>Distribución de reportes de baches por zona geográfica</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <AdminChart />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="map" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Calor de Baches</CardTitle>
                <CardDescription>Visualización de la concentración de baches por zona</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full overflow-hidden rounded-md border">
                  <AdminMap />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Recientes</CardTitle>
              <CardDescription>Últimos reportes de baches recibidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-md">
                      <img
                        src={`/placeholder.svg?height=100&width=100&text=${i}`}
                        alt={`Bache ${i}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Av. Independencia {1000 + i}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Hace {i} hora{i > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reportes por Gravedad</CardTitle>
              <CardDescription>Distribución de reportes según su nivel de gravedad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <span>Leve</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">32</span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/4 bg-yellow-400"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                    <span>Moderado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">56</span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/2 bg-orange-500"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span>Grave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">39</span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/3 bg-red-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

