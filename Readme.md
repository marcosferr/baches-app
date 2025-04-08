### Baches - Sistema de Reporte y Gestión de Baches

## Índice

- [Descripción](#descripción)
- [Características](#características)
- [Arquitectura](#arquitectura)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Modelos de Datos](#modelos-de-datos)
- [API Endpoints](#api-endpoints)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Server Actions](#server-actions)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Descripción

Baches es una aplicación web y móvil que permite a los ciudadanos reportar baches y problemas viales en su comunidad. Los usuarios pueden adjuntar fotos, descripciones y ubicaciones GPS de los baches, mientras que los administradores pueden verificar, aprobar y gestionar estos reportes. La aplicación incluye un mapa interactivo para visualizar los reportes y un sistema de notificaciones para mantener a los usuarios informados sobre el estado de sus reportes.

## Características

### Para Ciudadanos

- Crear cuenta e iniciar sesión
- Reportar baches con foto, descripción y geolocalización
- Ver reportes en un mapa interactivo
- Comentar y calificar la prioridad de reportes
- Recibir notificaciones sobre el estado de los reportes
- Gestionar preferencias de notificaciones

### Para Administradores

- Panel de administración con estadísticas
- Revisar y aprobar/rechazar reportes
- Asignar estados a los reportes (Pendiente, En proceso, Resuelto)
- Enviar notificaciones a los usuarios
- Generar reportes estadísticos

## Arquitectura

La aplicación está construida con las siguientes tecnologías:

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js
- **Mapas**: Leaflet
- **Notificaciones**: Sistema personalizado con soporte para notificaciones en la aplicación

## Instalación y Configuración

### Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- PostgreSQL (v12 o superior)

### Pasos de Instalación

1. Clonar el repositorio:

```shellscript
git clone https://github.com/tu-usuario/baches.git
cd baches
```

2. Instalar dependencias:

```shellscript
npm install
# o
yarn install
```

3. Configurar variables de entorno:

```shellscript
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

4. Configurar la base de datos:

```shellscript
npx prisma migrate dev
# o
yarn prisma migrate dev
```

5. Cargar datos iniciales (opcional):

```shellscript
npx prisma db seed
# o
yarn prisma db seed
```

6. Iniciar el servidor de desarrollo:

```shellscript
npm run dev
# o
yarn dev
```

7. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia la aplicación en modo producción
- `npm run lint` - Ejecuta el linter
- `npm run prisma:generate` - Genera el cliente Prisma
- `npm run prisma:migrate` - Ejecuta migraciones de la base de datos
- `npm run prisma:studio` - Abre Prisma Studio para gestionar la base de datos
- `npm run prisma:seed` - Carga datos iniciales en la base de datos

## Variables de Entorno

| Variable             | Descripción                                   | Valor por defecto       | Requerido |
| -------------------- | --------------------------------------------- | ----------------------- | --------- |
| `DATABASE_URL`       | URL de conexión a la base de datos PostgreSQL | -                       | Sí        |
| `NEXTAUTH_URL`       | URL base de la aplicación                     | `http://localhost:3000` | Sí        |
| `NEXTAUTH_SECRET`    | Secreto para firmar cookies de sesión         | -                       | Sí        |
| `JWT_SECRET`         | Secreto para firmar tokens JWT                | -                       | Sí        |
| `DEBUG_DISABLE_AUTH` | Deshabilita la autenticación para desarrollo  | `false`                 | No        |

### Configuración para Diferentes Entornos

#### Desarrollo

```plaintext
DATABASE_URL="postgresql://postgres:password@localhost:5432/baches_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto-desarrollo"
JWT_SECRET="tu-jwt-secreto-desarrollo"
DEBUG_DISABLE_AUTH=true
```

#### Producción

```plaintext
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/baches_prod"
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="tu-secreto-produccion-seguro"
JWT_SECRET="tu-jwt-secreto-produccion-seguro"
DEBUG_DISABLE_AUTH=false
```

## Modelos de Datos

### Diagrama de Entidad-Relación

```mermaid
Diagrama ER.download-icon {
            cursor: pointer;
            transform-origin: center;
        }
        .download-icon .arrow-part {
            transition: transform 0.35s cubic-bezier(0.35, 0.2, 0.14, 0.95);
             transform-origin: center;
        }
        button:has(.download-icon):hover .download-icon .arrow-part, button:has(.download-icon):focus-visible .download-icon .arrow-part {
          transform: translateY(-1.5px);
        }
        #mermaid-diagram-r3vl{font-family:var(--font-geist-sans);font-size:12px;fill:#000000;}#mermaid-diagram-r3vl .error-icon{fill:#552222;}#mermaid-diagram-r3vl .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-r3vl .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-r3vl .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-r3vl .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-r3vl .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-r3vl .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-r3vl .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-r3vl .marker{fill:#666;stroke:#666;}#mermaid-diagram-r3vl .marker.cross{stroke:#666;}#mermaid-diagram-r3vl svg{font-family:var(--font-geist-sans);font-size:12px;}#mermaid-diagram-r3vl p{margin:0;}#mermaid-diagram-r3vl .entityBox{fill:#eee;stroke:#999;}#mermaid-diagram-r3vl .attributeBoxOdd{fill:#ffffff;stroke:#999;}#mermaid-diagram-r3vl .attributeBoxEven{fill:#f2f2f2;stroke:#999;}#mermaid-diagram-r3vl .relationshipLabelBox{fill:hsl(-160, 0%, 93.3333333333%);opacity:0.7;background-color:hsl(-160, 0%, 93.3333333333%);}#mermaid-diagram-r3vl .relationshipLabelBox rect{opacity:0.5;}#mermaid-diagram-r3vl .relationshipLine{stroke:#666;}#mermaid-diagram-r3vl .entityTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-diagram-r3vl #MD_PARENT_START{fill:#f5f5f5!important;stroke:#666!important;stroke-width:1;}#mermaid-diagram-r3vl #MD_PARENT_END{fill:#f5f5f5!important;stroke:#666!important;stroke-width:1;}#mermaid-diagram-r3vl .flowchart-link{stroke:hsl(var(--gray-400));stroke-width:1px;}#mermaid-diagram-r3vl .marker,#mermaid-diagram-r3vl marker,#mermaid-diagram-r3vl marker *{fill:hsl(var(--gray-400))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r3vl .label,#mermaid-diagram-r3vl text,#mermaid-diagram-r3vl text>tspan{fill:hsl(var(--black))!important;color:hsl(var(--black))!important;}#mermaid-diagram-r3vl .background,#mermaid-diagram-r3vl rect.relationshipLabelBox{fill:hsl(var(--white))!important;}#mermaid-diagram-r3vl .entityBox,#mermaid-diagram-r3vl .attributeBoxEven{fill:hsl(var(--gray-150))!important;}#mermaid-diagram-r3vl .attributeBoxOdd{fill:hsl(var(--white))!important;}#mermaid-diagram-r3vl .label-container,#mermaid-diagram-r3vl rect.actor{fill:hsl(var(--white))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r3vl line{stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r3vl :root{--mermaid-font-family:var(--font-geist-sans);}UserstringidPKstringnamestringemailstringpasswordenumrolestringavatardatetimecreatedAtdatetimeupdatedAtReportstringidPKstringpicturestringdescriptionenumseverityenumstatusfloatlatitudefloatlongitudestringaddressstringauthorIdFKdatetimecreatedAtdatetimeupdatedAtCommentstringidPKstringtextstringreportIdFKstringuserIdFKdatetimecreatedAtdatetimeupdatedAtNotificationstringidPKstringtitlestringmessageenumtypebooleanreadstringrelatedIdstringuserIdFKdatetimecreatedAtdatetimeupdatedAtNotificationPreferencestringidPKstringuserIdFKbooleanreportUpdatesbooleancommentsbooleanemaildatetimecreatedAtdatetimeupdatedAtcreaescriberecibeconfiguratiene
```

### Descripción de Modelos

#### User

Representa a los usuarios de la aplicación, tanto ciudadanos como administradores.

| Campo       | Tipo     | Descripción                           |
| ----------- | -------- | ------------------------------------- |
| `id`        | String   | Identificador único (CUID)            |
| `name`      | String   | Nombre completo del usuario           |
| `email`     | String   | Correo electrónico (único)            |
| `password`  | String   | Contraseña (hash)                     |
| `role`      | Enum     | Rol: ADMIN o CITIZEN                  |
| `avatar`    | String?  | URL de la imagen de perfil (opcional) |
| `createdAt` | DateTime | Fecha de creación                     |
| `updatedAt` | DateTime | Fecha de última actualización         |

#### Report

Representa los reportes de baches creados por los usuarios.

| Campo         | Tipo     | Descripción                                      |
| ------------- | -------- | ------------------------------------------------ |
| `id`          | String   | Identificador único (CUID)                       |
| `picture`     | String   | URL o datos de la imagen del bache               |
| `description` | String   | Descripción del problema                         |
| `severity`    | Enum     | Gravedad: LOW, MEDIUM, HIGH                      |
| `status`      | Enum     | Estado: PENDING, IN_PROGRESS, RESOLVED, REJECTED |
| `latitude`    | Float    | Latitud de la ubicación                          |
| `longitude`   | Float    | Longitud de la ubicación                         |
| `address`     | String?  | Dirección (opcional)                             |
| `authorId`    | String   | ID del usuario que creó el reporte               |
| `createdAt`   | DateTime | Fecha de creación                                |
| `updatedAt`   | DateTime | Fecha de última actualización                    |

#### Comment

Representa los comentarios en los reportes.

| Campo       | Tipo     | Descripción                               |
| ----------- | -------- | ----------------------------------------- |
| `id`        | String   | Identificador único (CUID)                |
| `text`      | String   | Contenido del comentario                  |
| `reportId`  | String   | ID del reporte al que pertenece           |
| `userId`    | String   | ID del usuario que escribió el comentario |
| `createdAt` | DateTime | Fecha de creación                         |
| `updatedAt` | DateTime | Fecha de última actualización             |

#### Notification

Representa las notificaciones enviadas a los usuarios.

| Campo       | Tipo     | Descripción                                      |
| ----------- | -------- | ------------------------------------------------ |
| `id`        | String   | Identificador único (CUID)                       |
| `title`     | String   | Título de la notificación                        |
| `message`   | String   | Mensaje de la notificación                       |
| `type`      | Enum     | Tipo: REPORT_STATUS, COMMENT, APPROVAL, PRIORITY |
| `read`      | Boolean  | Indica si ha sido leída                          |
| `relatedId` | String?  | ID del objeto relacionado (reporte, comentario)  |
| `userId`    | String   | ID del usuario destinatario                      |
| `createdAt` | DateTime | Fecha de creación                                |
| `updatedAt` | DateTime | Fecha de última actualización                    |

#### NotificationPreference

Representa las preferencias de notificación de los usuarios.

| Campo           | Tipo     | Descripción                                           |
| --------------- | -------- | ----------------------------------------------------- |
| `id`            | String   | Identificador único (CUID)                            |
| `userId`        | String   | ID del usuario (único)                                |
| `reportUpdates` | Boolean  | Recibir notificaciones de actualizaciones de reportes |
| `comments`      | Boolean  | Recibir notificaciones de comentarios                 |
| `email`         | Boolean  | Recibir notificaciones por correo electrónico         |
| `createdAt`     | DateTime | Fecha de creación                                     |
| `updatedAt`     | DateTime | Fecha de última actualización                         |

## API Endpoints

### Reportes

#### Obtener Todos los Reportes

- **URL**: `/api/reports`
- **Método**: `GET`
- **Descripción**: Obtiene una lista de reportes con filtros opcionales
- **Parámetros de consulta**:

- `status`: Filtrar por estado (separados por comas, ej. "PENDING,IN_PROGRESS")
- `severity`: Filtrar por gravedad (separados por comas, ej. "LOW,MEDIUM")
- `userId`: Filtrar por usuario específico
- `lat`, `lng`, `radius`: Filtrado geográfico
- `page`, `limit`: Controles de paginación

- **Autenticación**: Opcional
- **Respuesta**:

```json
{
  "reports": [
    {
      "id": "clq1234abcd",
      "picture": "https://example.com/images/pothole1.jpg",
      "description": "Bache profundo en la avenida principal",
      "severity": "HIGH",
      "status": "PENDING",
      "latitude": -27.3364,
      "longitude": -55.8675,
      "address": "Av. Independencia 1234",
      "authorId": "clu5678efgh",
      "createdAt": "2023-10-15T14:30:00Z",
      "updatedAt": "2023-10-15T14:30:00Z",
      "author": {
        "id": "clu5678efgh",
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "avatar": null
      },
      "_count": {
        "comments": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

#### Crear Reporte

- **URL**: `/api/reports`
- **Método**: `POST`
- **Descripción**: Crea un nuevo reporte
- **Cuerpo**:

```json
{
  "picture": "base64-image-data-or-url",
  "description": "Descripción del bache",
  "severity": "MEDIUM",
  "latitude": -27.3364,
  "longitude": -55.8675,
  "address": "Av. Independencia 1234"
}
```

- **Autenticación**: Requerida
- **Límite de tasa**: 5 reportes por hora
- **Respuesta**:

```json
{
  "id": "clq1234abcd",
  "picture": "https://example.com/images/pothole1.jpg",
  "description": "Descripción del bache",
  "severity": "MEDIUM",
  "status": "PENDING",
  "latitude": -27.3364,
  "longitude": -55.8675,
  "address": "Av. Independencia 1234",
  "authorId": "clu5678efgh",
  "createdAt": "2023-10-15T14:30:00Z",
  "updatedAt": "2023-10-15T14:30:00Z",
  "author": {
    "id": "clu5678efgh",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

#### Obtener Reporte por ID

- **URL**: `/api/reports/:id`
- **Método**: `GET`
- **Descripción**: Obtiene un reporte específico con todos sus detalles y comentarios
- **Parámetros de ruta**: `id` - ID del reporte
- **Autenticación**: Opcional
- **Respuesta**:

```json
{
  "id": "clq1234abcd",
  "picture": "https://example.com/images/pothole1.jpg",
  "description": "Bache profundo en la avenida principal",
  "severity": "HIGH",
  "status": "PENDING",
  "latitude": -27.3364,
  "longitude": -55.8675,
  "address": "Av. Independencia 1234",
  "authorId": "clu5678efgh",
  "createdAt": "2023-10-15T14:30:00Z",
  "updatedAt": "2023-10-15T14:30:00Z",
  "author": {
    "id": "clu5678efgh",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "avatar": null
  },
  "comments": [
    {
      "id": "clr9876ijkl",
      "text": "Este bache es muy peligroso",
      "reportId": "clq1234abcd",
      "userId": "clu5678efgh",
      "createdAt": "2023-10-16T10:15:00Z",
      "updatedAt": "2023-10-16T10:15:00Z",
      "user": {
        "id": "clu5678efgh",
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "avatar": null
      }
    }
  ]
}
```

#### Actualizar Reporte

- **URL**: `/api/reports/:id`
- **Método**: `PATCH`
- **Descripción**: Actualiza un reporte existente
- **Parámetros de ruta**: `id` - ID del reporte
- **Cuerpo**:

```json
{
  "status": "IN_PROGRESS",
  "description": "Descripción actualizada",
  "severity": "HIGH"
}
```

- **Autenticación**: Requerida
- **Autorización**: El autor del reporte puede actualizar descripción y gravedad; los administradores pueden actualizar el estado
- **Respuesta**:

```json
{
  "id": "clq1234abcd",
  "picture": "https://example.com/images/pothole1.jpg",
  "description": "Descripción actualizada",
  "severity": "HIGH",
  "status": "IN_PROGRESS",
  "latitude": -27.3364,
  "longitude": -55.8675,
  "address": "Av. Independencia 1234",
  "authorId": "clu5678efgh",
  "createdAt": "2023-10-15T14:30:00Z",
  "updatedAt": "2023-10-17T09:45:00Z",
  "author": {
    "id": "clu5678efgh",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

#### Eliminar Reporte

- **URL**: `/api/reports/:id`
- **Método**: `DELETE`
- **Descripción**: Elimina un reporte
- **Parámetros de ruta**: `id` - ID del reporte
- **Autenticación**: Requerida
- **Autorización**: Solo el autor del reporte o un administrador
- **Respuesta**:

```json
{
  "success": true
}
```

### Comentarios

#### Obtener Comentarios

- **URL**: `/api/comments`
- **Método**: `GET`
- **Descripción**: Obtiene comentarios para un reporte específico
- **Parámetros de consulta**: `reportId` - ID del reporte
- **Autenticación**: Opcional
- **Respuesta**:

```json
[
  {
    "id": "clr9876ijkl",
    "text": "Este bache es muy peligroso",
    "reportId": "clq1234abcd",
    "userId": "clu5678efgh",
    "createdAt": "2023-10-16T10:15:00Z",
    "updatedAt": "2023-10-16T10:15:00Z",
    "user": {
      "id": "clu5678efgh",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "avatar": null
    }
  }
]
```

#### Crear Comentario

- **URL**: `/api/comments`
- **Método**: `POST`
- **Descripción**: Crea un nuevo comentario
- **Cuerpo**:

```json
{
  "reportId": "clq1234abcd",
  "text": "Este bache es muy peligroso"
}
```

- **Autenticación**: Requerida
- **Límite de tasa**: 10 comentarios por 5 minutos
- **Respuesta**:

```json
{
  "id": "clr9876ijkl",
  "text": "Este bache es muy peligroso",
  "reportId": "clq1234abcd",
  "userId": "clu5678efgh",
  "createdAt": "2023-10-16T10:15:00Z",
  "updatedAt": "2023-10-16T10:15:00Z",
  "user": {
    "id": "clu5678efgh",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "avatar": null
  }
}
```

#### Obtener Comentario por ID

- **URL**: `/api/comments/:id`
- **Método**: `GET`
- **Descripción**: Obtiene un comentario específico
- **Parámetros de ruta**: `id` - ID del comentario
- **Autenticación**: Opcional
- **Respuesta**:

```json
{
  "id": "clr9876ijkl",
  "text": "Este bache es muy peligroso",
  "reportId": "clq1234abcd",
  "userId": "clu5678efgh",
  "createdAt": "2023-10-16T10:15:00Z",
  "updatedAt": "2023-10-16T10:15:00Z",
  "user": {
    "id": "clu5678efgh",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "avatar": null
  },
  "report": {
    "id": "clq1234abcd",
    "description": "Bache profundo en la avenida principal",
    "status": "PENDING",
    "authorId": "clu5678efgh"
  }
}
```

#### Actualizar Comentario

- **URL**: `/api/comments/:id`
- **Método**: `PATCH`
- **Descripción**: Actualiza un comentario existente
- **Parámetros de ruta**: `id` - ID del comentario
- **Cuerpo**:

```json
{
  "text": "Este bache es extremadamente peligroso"
}
```

- **Autenticación**: Requerida
- **Autorización**: Solo el autor del comentario o un administrador
- **Respuesta**:

```json
{
  "id": "clr9876ijkl",
  "text": "Este bache es extremadamente peligroso",
  "reportId": "clq1234abcd",
  "userId": "clu5678efgh",
  "createdAt": "2023-10-16T10:15:00Z",
  "updatedAt": "2023-10-16T11:30:00Z",
  "user": {
    "id": "clu5678efgh",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "avatar": null
  }
}
```

#### Eliminar Comentario

- **URL**: `/api/comments/:id`
- **Método**: `DELETE`
- **Descripción**: Elimina un comentario
- **Parámetros de ruta**: `id` - ID del comentario
- **Autenticación**: Requerida
- **Autorización**: Autor del comentario, autor del reporte, o administrador
- **Respuesta**:

```json
{
  "success": true
}
```

### Notificaciones

#### Obtener Notificaciones del Usuario

- **URL**: `/api/notifications`
- **Método**: `GET`
- **Descripción**: Obtiene notificaciones para el usuario actual
- **Parámetros de consulta**:

- `unread`: Filtrar para mostrar solo notificaciones no leídas
- `page`, `limit`: Controles de paginación

- **Autenticación**: Requerida
- **Respuesta**:

```json
{
  "notifications": [
    {
      "id": "cls5432mnop",
      "title": "Estado del reporte actualizado",
      "message": "Tu reporte en Av. Independencia 1234 está en proceso de atención.",
      "type": "REPORT_STATUS",
      "read": false,
      "relatedId": "clq1234abcd",
      "userId": "clu5678efgh",
      "createdAt": "2023-10-17T09:45:00Z",
      "updatedAt": "2023-10-17T09:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  },
  "unreadCount": 3
}
```

#### Marcar Todas como Leídas

- **URL**: `/api/notifications`
- **Método**: `PATCH`
- **Descripción**: Marca todas las notificaciones como leídas
- **Autenticación**: Requerida
- **Respuesta**:

```json
{
  "success": true
}
```

#### Obtener Notificación por ID

- **URL**: `/api/notifications/:id`
- **Método**: `GET`
- **Descripción**: Obtiene una notificación específica
- **Parámetros de ruta**: `id` - ID de la notificación
- **Autenticación**: Requerida
- **Autorización**: La notificación debe pertenecer al usuario
- **Respuesta**:

```json
{
  "id": "cls5432mnop",
  "title": "Estado del reporte actualizado",
  "message": "Tu reporte en Av. Independencia 1234 está en proceso de atención.",
  "type": "REPORT_STATUS",
  "read": false,
  "relatedId": "clq1234abcd",
  "userId": "clu5678efgh",
  "createdAt": "2023-10-17T09:45:00Z",
  "updatedAt": "2023-10-17T09:45:00Z"
}
```

#### Marcar Notificación como Leída

- **URL**: `/api/notifications/:id`
- **Método**: `PATCH`
- **Descripción**: Marca una notificación como leída
- **Parámetros de ruta**: `id` - ID de la notificación
- **Cuerpo**:

```json
{
  "read": true
}
```

- **Autenticación**: Requerida
- **Autorización**: La notificación debe pertenecer al usuario
- **Respuesta**:

```json
{
  "id": "cls5432mnop",
  "title": "Estado del reporte actualizado",
  "message": "Tu reporte en Av. Independencia 1234 está en proceso de atención.",
  "type": "REPORT_STATUS",
  "read": true,
  "relatedId": "clq1234abcd",
  "userId": "clu5678efgh",
  "createdAt": "2023-10-17T09:45:00Z",
  "updatedAt": "2023-10-17T10:00:00Z"
}
```

#### Eliminar Notificación

- **URL**: `/api/notifications/:id`
- **Método**: `DELETE`
- **Descripción**: Elimina una notificación
- **Parámetros de ruta**: `id` - ID de la notificación
- **Autenticación**: Requerida
- **Autorización**: La notificación debe pertenecer al usuario
- **Respuesta**:

```json
{
  "success": true
}
```

### Preferencias de Notificación

#### Obtener Preferencias del Usuario

- **URL**: `/api/notifications/preferences`
- **Método**: `GET`
- **Descripción**: Obtiene preferencias de notificación para el usuario actual
- **Autenticación**: Requerida
- **Respuesta**:

```json
{
  "id": "clt6543qrst",
  "userId": "clu5678efgh",
  "reportUpdates": true,
  "comments": true,
  "email": false,
  "createdAt": "2023-10-01T12:00:00Z",
  "updatedAt": "2023-10-15T14:30:00Z"
}
```

#### Actualizar Preferencias

- **URL**: `/api/notifications/preferences`
- **Método**: `PUT`
- **Descripción**: Actualiza preferencias de notificación
- **Cuerpo**:

```json
{
  "reportUpdates": true,
  "comments": true,
  "email": false
}
```

- **Autenticación**: Requerida
- **Respuesta**:

```json
{
  "id": "clt6543qrst",
  "userId": "clu5678efgh",
  "reportUpdates": true,
  "comments": true,
  "email": false,
  "createdAt": "2023-10-01T12:00:00Z",
  "updatedAt": "2023-10-17T15:45:00Z"
}
```

## Autenticación y Autorización

### Sistema de Autenticación

La aplicación utiliza NextAuth.js para la autenticación de usuarios. Se implementa un flujo de autenticación basado en credenciales (email/contraseña) con sesiones JWT.

#### Flujo de Autenticación

1. El usuario envía sus credenciales (email y contraseña) al endpoint `/api/auth/signin`.
2. NextAuth verifica las credenciales contra la base de datos.
3. Si son válidas, se genera un token JWT que contiene información del usuario, incluyendo su ID y rol.
4. El token se almacena en una cookie segura.
5. Las solicitudes posteriores incluyen automáticamente esta cookie para autenticación.

#### Roles y Permisos

La aplicación tiene dos roles principales:

1. **Ciudadano (CITIZEN)**

1. Puede crear y ver reportes
1. Puede comentar en reportes
1. Puede editar sus propios reportes y comentarios
1. Puede ver y gestionar sus notificaciones

1. **Administrador (ADMIN)**

1. Tiene todos los permisos de Ciudadano
1. Puede aprobar/rechazar reportes
1. Puede cambiar el estado de los reportes
1. Puede acceder al panel de administración
1. Puede ver estadísticas y generar informes

### Middleware de Protección de Rutas

La aplicación utiliza un middleware para proteger rutas específicas:

- Rutas administrativas (`/admin/*`): Solo accesibles para usuarios con rol ADMIN
- Rutas autenticadas (`/report`, `/my-reports`, etc.): Requieren inicio de sesión
- Rutas de autenticación (`/login`, `/register`): Redirigen a usuarios ya autenticados

### Ejemplo de Uso de Autenticación

```typescript
// Verificar autenticación en un endpoint de API
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Continuar con la lógica del endpoint
  // ...
}
```

## Server Actions

Además de los endpoints REST, la aplicación proporciona Server Actions para su uso directo en componentes React:

### Acciones para Reportes

```typescript
// Obtener reportes con filtros opcionales
const { reports, pagination } = await getReports({
  status: ["PENDING", "IN_PROGRESS"],
  severity: ["HIGH"],
  page: 1,
  limit: 10,
});

// Obtener un reporte específico
const report = await getReportById("clq1234abcd");

// Crear un nuevo reporte
const result = await createReport(formData);

// Actualizar un reporte
const result = await updateReport("clq1234abcd", {
  status: "IN_PROGRESS",
  description: "Descripción actualizada",
});

// Eliminar un reporte
const result = await deleteReport("clq1234abcd");
```

### Acciones para Comentarios

```typescript
// Obtener comentarios de un reporte
const comments = await getComments("clq1234abcd");

// Crear un comentario
const result = await createComment({
  reportId: "clq1234abcd",
  text: "Este bache es muy peligroso",
});

// Actualizar un comentario
const result = await updateComment("clr9876ijkl", {
  text: "Texto actualizado",
});

// Eliminar un comentario
const result = await deleteComment("clr9876ijkl");
```

### Acciones para Notificaciones

```typescript
// Obtener notificaciones
const { notifications, pagination, unreadCount } = await getNotifications({
  unreadOnly: true,
  page: 1,
  limit: 20,
});

// Marcar notificación como leída
const result = await markAsRead("cls5432mnop");

// Marcar todas las notificaciones como leídas
const result = await markAllAsRead();

// Eliminar notificación
const result = await removeNotification("cls5432mnop");

// Obtener preferencias de notificación
const preferences = await getNotificationPreferences();

// Actualizar preferencias de notificación
const result = await updateNotificationPreferences({
  reportUpdates: true,
  comments: false,
  email: true,
});
```

## Ejemplos de Uso

### Crear un Reporte

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReport } from "@/lib/actions/report-actions";
import { useToast } from "@/hooks/use-toast";

export default function ReportForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createReport(formData);

      toast({
        title: "Reporte enviado",
        description: "Tu reporte ha sido enviado correctamente.",
      });

      router.push(`/reports/${result.reportId}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al enviar el reporte",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="picture" accept="image/*" required />
      <textarea name="description" placeholder="Descripción" required />
      <select name="severity" required>
        <option value="LOW">Leve</option>
        <option value="MEDIUM">Moderado</option>
        <option value="HIGH">Grave</option>
      </select>
      <input type="hidden" name="latitude" value="123.456" />
      <input type="hidden" name="longitude" value="78.901" />
      <input type="text" name="address" placeholder="Dirección" />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar Reporte"}
      </button>
    </form>
  );
}
```

### Mostrar Reportes en un Mapa

```typescript
"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getReports } from "@/lib/actions/report-actions";
import { useToast } from "@/hooks/use-toast";

export default function ReportsMap() {
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const result = await getReports();
        setReports(result.reports);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los reportes",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [toast]);

  if (isLoading) {
    return <div>Cargando mapa...</div>;
  }

  return (
    <MapContainer
      center={[-27.3364, -55.8675]}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {reports.map((report) => (
        <Marker key={report.id} position={[report.latitude, report.longitude]}>
          <Popup>
            <div>
              <h3>{report.address || "Reporte de bache"}</h3>
              <p>{report.description}</p>
              <p>Estado: {report.status}</p>
              <p>Gravedad: {report.severity}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### Gestionar Notificaciones

```typescript
"use client";

import { useState, useEffect } from "react";
import {
  getNotifications,
  markAsRead,
  removeNotification,
} from "@/lib/actions/notification-actions";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsList() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const result = await getNotifications();
      setNotifications(result.notifications);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las notificaciones",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Cargando notificaciones...</div>;
  }

  return (
    <div>
      <h2>Mis Notificaciones</h2>
      {notifications.length === 0 ? (
        <p>No tienes notificaciones</p>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={notification.read ? "" : "unread"}
            >
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
              <div>
                {!notification.read && (
                  <button onClick={() => handleMarkAsRead(notification.id)}>
                    Marcar como leída
                  </button>
                )}
                <button onClick={() => handleDelete(notification.id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Contribución

¡Agradecemos tu interés en contribuir al proyecto Baches! Sigue estas pautas para contribuir:

### Proceso de Contribución

1. **Fork del repositorio**: Crea un fork del repositorio en tu cuenta de GitHub.
2. **Clonar el fork**: `git clone https://github.com/tu-usuario/baches.git`
3. **Crear una rama**: `git checkout -b feature/nueva-funcionalidad`
4. **Realizar cambios**: Implementa tus cambios siguiendo las guías de estilo.
5. **Pruebas**: Asegúrate de que tus cambios pasen todas las pruebas.
6. **Commit**: `git commit -m "Añadir nueva funcionalidad"`
7. **Push**: `git push origin feature/nueva-funcionalidad`
8. **Pull Request**: Crea un PR desde tu fork al repositorio principal.

### Guías de Estilo

- **TypeScript**: Sigue las reglas de ESLint configuradas en el proyecto.
- **React**: Utiliza componentes funcionales y hooks.
- **Prisma**: Sigue las convenciones de nomenclatura para modelos y campos.
- **Commits**: Usa mensajes de commit descriptivos y concisos.

### Pruebas

Antes de enviar un PR, asegúrate de:

1. Ejecutar el linter: `npm run lint`
2. Ejecutar las pruebas: `npm test`
3. Verificar que la aplicación funciona correctamente en desarrollo: `npm run dev`

### Reportar Problemas

Si encuentras un bug o tienes una sugerencia:

1. Verifica que el problema no haya sido reportado anteriormente.
2. Usa la plantilla de issues para proporcionar toda la información necesaria.
3. Incluye pasos para reproducir el problema y capturas de pantalla si es posible.

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).

```plaintext
MIT License

Copyright (c) 2023 Observatorio de Datos Itapúa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
