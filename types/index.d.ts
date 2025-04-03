import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "CITIZEN";
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "CITIZEN";
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CITIZEN";
  createdAt?: string;
  updatedAt?: string;
}
