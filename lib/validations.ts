import { z } from "zod";

// Report validations
export const createReportSchema = z.object({
  picture: z.string().min(1, "La imagen es requerida"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"], {
    errorMap: () => ({
      message: "La gravedad debe ser: leve, moderada o alta",
    }),
  }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
});

export const updateReportSchema = z.object({
  id: z.string().min(1),
  status: z
    .enum(["SUBMITTED", "PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"])
    .optional(),
  description: z.string().min(10).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  address: z.string().optional(),
});

// Comment validations
export const createCommentSchema = z.object({
  reportId: z.string().min(1, "El ID del reporte es requerido"),
  text: z
    .string()
    .min(1, "El comentario no puede estar vacío")
    .max(500, "El comentario es demasiado largo"),
});

export const updateCommentSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(500),
});

// Notification validations
export const updateNotificationSchema = z.object({
  id: z.string().min(1),
  read: z.boolean(),
});

export const notificationPreferencesSchema = z.object({
  reportUpdates: z.boolean().default(true),
  comments: z.boolean().default(true),
  email: z.boolean().default(true),
});
