"use client"

import { useState } from "react"
import { X, ThumbsUp, ThumbsDown, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ReportComments } from "@/components/report-comments"
import type { Report } from "@/types"

interface BacheDetailsProps {
  bache: Report
  onClose: () => void
}

export function BacheDetails({ bache, onClose }: BacheDetailsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "comments">("details")

  const getStatusBadge = () => {
    switch (bache.status) {
      case "pending":
        return <Badge className="bg-orange-500">Pendiente</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500">En Proceso</Badge>
      case "resolved":
        return <Badge className="bg-green-500">Resuelto</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rechazado</Badge>
      default:
        return null
    }
  }

  const getSeverityBadge = () => {
    switch (bache.severity) {
      case "low":
        return (
          <Badge variant="outline" className="border-yellow-300 text-yellow-600 dark:text-yellow-400">
            Leve
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="border-orange-300 text-orange-600 dark:text-orange-400">
            Moderado
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="border-red-300 text-red-600 dark:text-red-400">
            Grave
          </Badge>
        )
      default:
        return null
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-PY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "details" | "comments")}>
      <div className="flex items-center justify-between border-b p-3">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="comments">
            Comentarios
            <Badge variant="secondary" className="ml-1">
              {bache.comments?.length || 0}
            </Badge>
          </TabsTrigger>
        </TabsList>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <TabsContent value="details" className="p-4">
        <div className="mb-4 aspect-video w-full overflow-hidden rounded-md">
          <img
            src={bache.picture || "/placeholder.svg"}
            alt="Imagen del bache"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {getStatusBadge()}
          {getSeverityBadge()}
        </div>

        <div className="mb-4 space-y-2">
          <h3 className="font-semibold">Ubicación</h3>
          <p className="text-sm text-muted-foreground">
            {bache.location.address || `${bache.location.lat.toFixed(6)}, ${bache.location.lng.toFixed(6)}`}
          </p>
        </div>

        <div className="mb-4 space-y-2">
          <h3 className="font-semibold">Descripción</h3>
          <p className="text-sm text-muted-foreground">{bache.description}</p>
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Reportado el {formatDate(bache.date_created)}</span>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" size="sm" className="gap-2">
            <ThumbsUp className="h-4 w-4" />
            Priorizar
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <ThumbsDown className="h-4 w-4" />
            No es urgente
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="comments" className="p-4">
        <ReportComments reportId={bache.id} />
      </TabsContent>
    </Tabs>
  )
}

