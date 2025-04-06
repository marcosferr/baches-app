import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Configure Prisma Client with options based on environment
const prismaClientOptions =
  process.env.NODE_ENV === "production"
    ? {
        // In production, don't log queries for better performance
        log: ["error", "warn"],
      }
    : {
        // In development, log all queries for debugging
        log: ["query", "error", "warn"],
      };

export const prisma =
  globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

// In development, attach the Prisma instance to the global object
// to prevent multiple instances during hot reloading
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
