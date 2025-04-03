import "next-auth"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role?: "admin" | "citizen"
  }

  interface Session {
    user: {
      id: string
      role: "admin" | "citizen"
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "citizen"
    id?: string
  }
}

