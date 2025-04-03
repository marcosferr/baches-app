"use client"

export function AdminMap() {
  // En un caso real, usaríamos una biblioteca como Google Maps o Leaflet con capa de calor
  // Esta es una simulación simple para el propósito de este ejemplo

  return (
    <div className="relative h-full w-full bg-[url('/placeholder.svg?height=600&width=1000')] bg-cover bg-center">
      {/* Simulación de mapa de calor con gradientes */}
      <div className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-gradient-radial from-red-500/70 to-transparent blur-md"></div>
      <div className="absolute left-1/2 top-1/3 h-40 w-40 rounded-full bg-gradient-radial from-orange-500/70 to-transparent blur-md"></div>
      <div className="absolute left-2/3 top-1/2 h-24 w-24 rounded-full bg-gradient-radial from-yellow-500/70 to-transparent blur-md"></div>
    </div>
  )
}

