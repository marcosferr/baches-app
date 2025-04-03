import "next-auth"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: "admin" | "citizen"
    image?: string | null
  }

  interface Session {
    user: {
      id: string
      role: "admin" | "citizen"
      image?: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "citizen"
    id: string
  }
}

