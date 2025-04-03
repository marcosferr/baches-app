import PublicMapView from "./public-map-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mapa Público de Baches | Sistema de Reporte y Gestión de Baches",
  description: "Visualiza todos los reportes de baches en la ciudad en un mapa interactivo",
}

export default function PublicMapPage() {
  return <PublicMapView />
}

