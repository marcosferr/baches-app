"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User, Mail, Camera, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/protected-route"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load user data when session changes
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      // If we had avatar in the session, we would set it here
    }
  }, [session])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
        setAvatar(file as unknown as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      if (avatar) {
        formData.append("avatar", avatar)
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error updating profile")
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          name,
          // If we had avatar in the response, we would update it here
        },
      })

      setIsEditing(false)
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar tu perfil. Intenta de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setName(session?.user?.name || "")
    setAvatar(null)
    setAvatarPreview(null)
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "citizen"]}>
      <div className="container mx-auto py-8">
        <h1 className="mb-8 text-3xl font-bold">Mi Perfil</h1>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex flex-col items-center">
                      {isEditing ? (
                        <div className="mb-4 flex flex-col items-center">
                          <div className="group relative mb-2 h-24 w-24 overflow-hidden rounded-full">
                            <Avatar className="h-24 w-24">
                              {avatarPreview ? (
                                <AvatarImage src={avatarPreview} alt={name} />
                              ) : (
                                <>
                                  <AvatarImage src={session?.user?.image || undefined} alt={name} />
                                  <AvatarFallback className="text-2xl">
                                    {getInitials(session?.user?.name || "")}
                                  </AvatarFallback>
                                </>
                              )}
                            </Avatar>
                            <label
                              htmlFor="avatar"
                              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Camera className="h-6 w-6 text-white" />
                            </label>
                            <input
                              id="avatar"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">Haz clic para cambiar</span>
                        </div>
                      ) : (
                        <Avatar className="mb-4 h-24 w-24">
                          <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || ""} />
                          <AvatarFallback className="text-2xl">{getInitials(session?.user?.name || "")}</AvatarFallback>
                        </Avatar>
                      )}
                      <CardTitle>{session?.user?.name}</CardTitle>
                      <CardDescription className="mt-1">{session?.user?.email}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge className="mb-2">{session?.user?.role === "admin" ? "Administrador" : "Ciudadano"}</Badge>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-4 w-full">
                        Editar perfil
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Estadísticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Reportes creados</span>
                          <span className="font-medium">12</span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full w-[80%] bg-primary"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Reportes resueltos</span>
                          <span className="font-medium">8</span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full w-[60%] bg-green-500"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Comentarios</span>
                          <span className="font-medium">24</span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full w-[40%] bg-blue-500"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{isEditing ? "Editar Perfil" : "Información Personal"}</CardTitle>
                    <CardDescription>
                      {isEditing ? "Actualiza tu información personal" : "Detalles de tu cuenta"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre completo</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="name"
                              placeholder="Tu nombre completo"
                              className="pl-10"
                              value={name}
                              onChange={handleNameChange}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Correo electrónico</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              placeholder="correo@ejemplo.com"
                              className="pl-10"
                              value={session?.user?.email || ""}
                              disabled
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">El correo electrónico no se puede modificar</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Nombre completo</h3>
                          <p>{session?.user?.name}</p>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Correo electrónico</h3>
                          <p>{session?.user?.email}</p>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Rol</h3>
                          <p>{session?.user?.role === "admin" ? "Administrador" : "Ciudadano"}</p>
                        </div>
                        <div>
                          <h3 className="mb-1 text-sm font-medium text-muted-foreground">Miembro desde</h3>
                          <p>Enero 2023</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  {isEditing && (
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={isLoading} className="gap-2">
                        {isLoading ? (
                          "Guardando..."
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Guardar cambios
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  )}
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Actividad reciente</CardTitle>
                    <CardDescription>Tu actividad en los últimos 30 días</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                        <div className="flex-1">
                          <p className="font-medium">Reporte resuelto</p>
                          <p className="text-sm text-muted-foreground">
                            Tu reporte en Av. Independencia 1234 ha sido marcado como resuelto.
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Hace 2 días</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start gap-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                        <div className="flex-1">
                          <p className="font-medium">Comentario añadido</p>
                          <p className="text-sm text-muted-foreground">
                            Comentaste en un reporte: "Gracias por la rápida respuesta".
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Hace 5 días</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-start gap-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-orange-500"></div>
                        <div className="flex-1">
                          <p className="font-medium">Nuevo reporte</p>
                          <p className="text-sm text-muted-foreground">
                            Has creado un nuevo reporte en Calle San Martín 567.
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Hace 1 semana</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Ver toda la actividad
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Seguridad de la cuenta</CardTitle>
                  <CardDescription>Administra tu contraseña y la seguridad de tu cuenta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="current-password">Contraseña actual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Cambiar contraseña</Button>
                </CardFooter>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Seguridad de la cuenta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Última actualización de contraseña</span>
                      <span className="text-sm text-muted-foreground">hace 3 meses</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Último inicio de sesión</span>
                      <span className="text-sm text-muted-foreground">hoy</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Notificaciones</CardTitle>
                  <CardDescription>Administra tus preferencias de notificaciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Actualizaciones de reportes</p>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones cuando haya actualizaciones en tus reportes
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="report-updates"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Comentarios</p>
                        <p className="text-sm text-muted-foreground">
                          Recibe notificaciones cuando alguien comente en tus reportes
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="comments"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Correo electrónico</p>
                        <p className="text-sm text-muted-foreground">Recibe notificaciones por correo electrónico</p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="email-notifications"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Guardar preferencias
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Idioma y región</CardTitle>
                  <CardDescription>Configura el idioma y la región de tu cuenta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
                      <select
                        id="language"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue="es"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="gn">Guaraní</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Zona horaria</Label>
                      <select
                        id="timezone"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        defaultValue="America/Asuncion"
                      >
                        <option value="America/Asuncion">Asunción (GMT-4)</option>
                        <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                        <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Guardar cambios
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}

