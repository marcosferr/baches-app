import Link from "next/link";
import { MapPin, Map, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4 py-20 text-center dark:from-orange-950 dark:to-background md:py-32">
        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
          Sistema de Reporte de Baches
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Ayuda a mejorar las calles de tu ciudad reportando baches y problemas
          viales. Tu participación es clave para una ciudad mejor.
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
        <h2 className="mb-12 text-center text-3xl font-bold">
          ¿Cómo funciona?
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <MapPin className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Reporta</h3>
            <p className="text-muted-foreground">
              Toma una foto del bache, describe el problema y marca la ubicación
              en el mapa.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <Map className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Visualiza</h3>
            <p className="text-muted-foreground">
              Explora el mapa para ver todos los baches reportados y su estado
              actual.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              Recibe Actualizaciones
            </h3>
            <p className="text-muted-foreground">
              Mantente informado sobre el estado de tus reportes y cuando sean
              resueltos.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto py-16 border-t">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-3xl font-bold">Contáctanos</h2>
            <p className="mb-6 text-muted-foreground">
              ¿Tienes preguntas o sugerencias sobre el sistema de reporte de
              baches? Completa el formulario y nos pondremos en contacto contigo
              lo antes posible.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-orange-500"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">GitHub</h4>
                <a
                  href="https://github.com/marcosferr/baches-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  github.com/marcosferr/baches-app
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-orange-500"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">LinkedIn</h4>
                <a
                  href="https://www.linkedin.com/in/marcos-adrian-ferreira/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  linkedin.com/in/marcos-adrian-ferreira
                </a>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
