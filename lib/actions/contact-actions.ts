"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validations";
import { RateLimiter } from "@/lib/rate-limiter";
import type { z } from "zod";

// Rate limiter: max 5 contact form submissions per hour
const contactFormLimiter = new RateLimiter({
  interval: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
});

/**
 * Submit a contact form
 */
export async function submitContactForm(data: z.infer<typeof contactFormSchema>) {
  try {
    // Generate a unique ID for rate limiting (using IP or a random ID for anonymous users)
    const uniqueId = Math.random().toString(36).substring(2, 15);
    
    // Rate limiting
    const rateLimited = await contactFormLimiter.check(uniqueId);
    if (rateLimited) {
      throw new Error("Has enviado demasiados mensajes. Por favor, intenta más tarde.");
    }

    // Validate input
    const validationResult = contactFormSchema.safeParse(data);
    if (!validationResult.success) {
      throw new Error(
        Object.values(validationResult.error.flatten().fieldErrors)
          .flat()
          .join(", ")
      );
    }

    const { name, email, subject, message } = validationResult.data;

    // Create the contact entry
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        message,
        status: "PENDING",
      },
    });

    revalidatePath("/");

    return { success: true, contact };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Error al enviar el formulario de contacto");
  }
}
