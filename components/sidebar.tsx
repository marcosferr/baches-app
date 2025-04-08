"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  MapPin,
  FileText,
  Map,
  Bell,
  User,
  Settings,
  BarChart3,
  CheckSquare,
  LogOut,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ThemeSwitch } from "@/components/theme-switch";

interface SidebarProps {
  userRole: "citizen" | "admin";
}

export function AppSidebar({ userRole = "citizen" }: SidebarProps) {
  const pathname = usePathname();

  const { data: session, status } = useSession();

  // Use the authenticated user's role if available
  const effectiveRole = session?.user?.role || userRole;

  // Public menu items (available to all users)
  const publicMenuItems = [
    {
      title: "Inicio",
      icon: MapPin,
      href: "/",
    },
    {
      title: "Mapa Público",
      icon: Globe,
      href: "/public-map",
    },
  ];

  const citizenMenuItems = [
    ...publicMenuItems,
    {
      title: "Reportar Bache",
      icon: MapPin,
      href: "/report",
    },
    {
      title: "Mis Reportes",
      icon: FileText,
      href: "/my-reports",
    },
    {
      title: "Notificaciones",
      icon: Bell,
      href: "/notifications",
    },
    {
      title: "Mi Perfil",
      icon: User,
      href: "/profile",
    },
  ];

  const adminMenuItems = [
    ...publicMenuItems,
    {
      title: "Dashboard",
      icon: BarChart3,
      href: "/admin/dashboard",
    },
    {
      title: "Gestión de Reportes",
      icon: CheckSquare,
      href: "/admin/reports",
    },
    {
      title: "Notificaciones",
      icon: Bell,
      href: "/admin/notifications",
    },
    {
      title: "Configuración",
      icon: Settings,
      href: "/admin/settings",
    },
  ];

  // Skip sidebar on auth pages
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/reset-password")
  ) {
    return null;
  }

  // If user is not authenticated, show only public menu items
  const menuItems =
    status !== "authenticated"
      ? publicMenuItems
      : effectiveRole === "admin"
      ? adminMenuItems
      : citizenMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="font-semibold">
            {status === "authenticated"
              ? effectiveRole === "admin"
                ? "Admin Baches"
                : "Reporte Baches"
              : "Baches App"}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.title}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <ThemeSwitch />
          {status === "authenticated" ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <Link href="/login">
                <User className="h-4 w-4" />
                <span>Iniciar sesión</span>
              </Link>
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
