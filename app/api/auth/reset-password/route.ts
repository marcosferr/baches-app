import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { validateResetToken } from "./request/route"

// Mock users database - in a real app, this would be in a database
// This should be the same users array as in [...nextauth]/route.ts
// For simplicity, we're duplicating it here
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

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    // Validate token
    const email = validateResetToken(token)
    if (!email) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Find user
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await hash(password, 10)

    // Update user's password
    users[userIndex] = {
      ...users[userIndex],
      password: hashedPassword,
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "An error occurred while resetting your password" }, { status: 500 })
  }
}

