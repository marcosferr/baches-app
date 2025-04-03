"use client"

import type React from "react"
import { useSession } from "next-auth/react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ("admin" | "citizen")[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { data: session, status } = useSession()

  // Show loading state while checking authentication
  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>
  }

  // If not authenticated, the middleware will handle redirection
  if (status === "unauthenticated") {
    return null
  }

  // If role check is required and user doesn't have the required role, don't render children
  // The middleware will handle redirection, but this is an extra safety check
  if (allowedRoles && session?.user && !allowedRoles.includes(session.user.role)) {
    return null
  }

  // If authenticated and has the required role (or no role check), render children
  return <>{children}</>
}

