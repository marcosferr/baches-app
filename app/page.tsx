import Link from "next/link"
import { MapPin, Map, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4 py-20 text-center dark:from-orange-950 dark:to-background md:py-32">
        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">Sistema de Reporte de Baches</h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Ayuda a mejorar las calles de tu ciudad reportando baches y problemas viales. Tu participación es clave para
          una ciudad mejor.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="/report">
              <MapPin className="h-5 w-5" />
              Reportar un Bache
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/map">
              <Map className="h-5 w-5" />
              Ver en el Mapa
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">¿Cómo funciona?</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <MapPin className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Reporta</h3>
            <p className="text-muted-foreground">
              Toma una foto del bache, describe el problema y marca la ubicación en el mapa.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <Map className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Visualiza</h3>
            <p className="text-muted-foreground">
              Explora el mapa para ver todos los baches reportados y su estado actual.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Recibe Actualizaciones</h3>
            <p className="text-muted-foreground">
              Mantente informado sobre el estado de tus reportes y cuando sean resueltos.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

