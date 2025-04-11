import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Reporte y Gestión de Baches",
  description: "Aplicación para reportar y gestionar baches en la vía pública",
  generator: "v0.dev",
  openGraph: {
    title: "Sistema de Reporte y Gestión de Baches",
    description:
      "Aplicación para reportar y gestionar baches en la vía pública",
    images: [
      {
        url: "/og-image.jpg", // Place this image in your public folder
        width: 1200,
        height: 600,
        alt: "Sistema de Reporte y Gestión de Baches",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema de Reporte y Gestión de Baches",
    description:
      "Aplicación para reportar y gestionar baches en la vía pública",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar userRole="citizen" />
              <SidebarInset>
                <main className="flex min-h-screen flex-col">{children}</main>
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
