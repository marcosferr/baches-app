"use client"

import { useState } from "react"
import { CheckCircle, Clock, XCircle, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ReportDetailsProps {
  report: {
    id: string
    address: string
    reportDate: string
    status: string
    severity: string
    reporter: string
    image: string
    description: string
  }
  onClose: () => void
  onStatusChange: (status: string, message?: string) => void
}

export function ReportDetails({ report, onClose, onStatusChange }: ReportDetailsProps) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getStatusBadge = () => {
    switch (report.status) {
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

  const getSeverityBadge = () => {
    switch (report.severity) {
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

  const handleStatusChange = async (status: string) => {
    setIsSubmitting(true)

    // Simulación de envío
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onStatusChange(status, message)
    setIsSubmitting(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalles del Reporte</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="actions">Acciones</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="aspect-video w-full overflow-hidden rounded-md border">
                  <img
                    src={report.image || "/placeholder.svg"}
                    alt="Imagen del bache"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Dirección</h3>
                  <p className="font-medium">{report.address}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Fecha de Reporte</h3>
                  <p>{report.reportDate}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Reportado por</h3>
                  <p>{report.reporter}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
                  <div>{getStatusBadge()}</div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Gravedad</h3>
                  <div>{getSeverityBadge()}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Descripción</h3>
              <p>{report.description}</p>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje para el ciudadano (opcional)</Label>
              <Textarea
                id="message"
                placeholder="Escribe un mensaje que se enviará al ciudadano..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {report.status === "pending" && (
                <>
                  <Button className="gap-2" onClick={() => handleStatusChange("in_progress")} disabled={isSubmitting}>
                    <Clock className="h-4 w-4" />
                    Marcar En Proceso
                  </Button>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => handleStatusChange("rejected")}
                    disabled={isSubmitting}
                  >
                    <XCircle className="h-4 w-4" />
                    Rechazar Reporte
                  </Button>
                </>
              )}

              {report.status === "in_progress" && (
                <Button className="gap-2" onClick={() => handleStatusChange("resolved")} disabled={isSubmitting}>
                  <CheckCircle className="h-4 w-4" />
                  Marcar como Resuelto
                </Button>
              )}

              {report.status === "resolved" && (
                <Button className="gap-2" onClick={() => handleStatusChange("in_progress")} disabled={isSubmitting}>
                  <Clock className="h-4 w-4" />
                  Reabrir Reporte
                </Button>
              )}
            </div>

            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Nota:</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Al cambiar el estado del reporte, se enviará una notificación automática al ciudadano. Si incluyes un
                mensaje, este se adjuntará a la notificación.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

