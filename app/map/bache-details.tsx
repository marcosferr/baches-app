"use client";

import { useState } from "react";
import { X, ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ReportComments } from "@/components/report-comments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { MapPin, Calendar, MessageSquare } from "lucide-react";
import type { Report } from "@prisma/client";

// Function to format dates
const formatDate = (dateString: Date | string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

// Status mapping helper
const getStatusLabel = (status: string) => {
  switch (status) {
    case "PENDING":
      return { label: "Pendiente", color: "bg-orange-500" };
    case "IN_PROGRESS":
      return { label: "En Proceso", color: "bg-blue-500" };
    case "RESOLVED":
      return { label: "Resuelto", color: "bg-green-500" };
    case "REJECTED":
      return { label: "Rechazado", color: "bg-red-500" };
    default:
      return { label: status, color: "bg-gray-500" };
  }
};

// Severity mapping helper
const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case "LOW":
      return {
        label: "Leve",
        color: "border-yellow-300 text-yellow-600 dark:text-yellow-400",
      };
    case "MEDIUM":
      return {
        label: "Moderado",
        color: "border-orange-300 text-orange-600 dark:text-orange-400",
      };
    case "HIGH":
      return {
        label: "Grave",
        color: "border-red-300 text-red-600 dark:text-red-400",
      };
    default:
      return {
        label: severity,
        color: "border-gray-300 text-gray-600 dark:text-gray-400",
      };
  }
};

interface BacheDetailsProps {
  bache: Report & { _count?: { comments: number } };
  onClose: () => void;
}

export function BacheDetails({ bache, onClose }: BacheDetailsProps) {
  const statusInfo = getStatusLabel(bache.status);
  const severityInfo = getSeverityLabel(bache.severity);

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalles del Reporte</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="aspect-video overflow-hidden rounded-lg">
              <img
                src={bache.picture}
                alt="Imagen del bache"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              <Badge variant="outline" className={severityInfo.color}>
                Gravedad: {severityInfo.label}
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Descripción</h3>
              <p className="text-sm text-muted-foreground">
                {bache.description}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {bache.address ||
                  `${bache.latitude.toFixed(6)}, ${bache.longitude.toFixed(6)}`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Reportado el {formatDate(bache.createdAt)}</span>
            </div>

            {bache._count && (
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>{bache._count.comments} comentarios</span>
              </div>
            )}

            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 font-semibold">Estado del Reporte</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Creado</span>
                  <Badge
                    variant="outline"
                    className="bg-primary text-primary-foreground"
                  >
                    {formatDate(bache.createdAt)}
                  </Badge>
                </div>
                {bache.status !== "PENDING" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Actualizado</span>
                    <Badge
                      variant="outline"
                      className="bg-primary text-primary-foreground"
                    >
                      {formatDate(bache.updatedAt)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={onClose}>
                Cerrar
              </Button>
              <Button className="w-full">Ver en el Mapa</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
