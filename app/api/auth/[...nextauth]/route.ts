import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare, hash } from "bcrypt"
import type { NextAuthOptions } from "next-auth"

// Mock users database - in a real app, this would be in a database
const users = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@example.com",
    password: "$2b$10$8OxDEuDS1WFsGiGpUK.YLOcSuLkCDgJIPjuSOULGqJ3FIQhkbwYdC", // "adminpassword"
    role: "admin",
  },
  {
    id: "user-1",
    name: "Regular User",
    email: "user@example.com",
    password: "$2b$10$8OxDEuDS1WFsGiGpUK.YLOcSuLkCDgJIPjuSOULGqJ3FIQhkbwYdC", // "userpassword"
    role: "citizen",
  },
]

// Helper function to find a user by email
const findUserByEmail = (email: string) => {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase())
}

// Helper function to add a new user
export const addUser = async (name: string, email: string, password: string) => {
  const existingUser = findUserByEmail(email)
  if (existingUser) {
    return null
  }

  const hashedPassword = await hash(password, 10)
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password: hashedPassword,
    role: "citizen",
  }

  users.push(newUser)
  return newUser
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = findUserByEmail(credentials.email)
        if (!user) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "admin" | "citizen"
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Export a function to register new users (to be used in the register API route)
// export const registerUser = async (name: string, email: string, password: string) => {
//   return await addUser(name, email, password)
// }

