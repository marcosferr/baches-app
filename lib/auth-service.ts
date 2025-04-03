import { v4 as uuidv4 } from "uuid"
import { ApiService } from "./api-service"
import type { User } from "@/types"

// Mock users for demonstration
const mockUsers = [
  {
    id: "admin-1",
    email: "admin@example.com",
    password: "hashed_password_here", // In a real app, this would be properly hashed
    name: "Admin User",
    role: "admin",
    created_by: "system",
    updated_by: "system",
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  },
  {
    id: "user-1",
    email: "user@example.com",
    password: "hashed_password_here", // In a real app, this would be properly hashed
    name: "Regular User",
    role: "citizen",
    created_by: "system",
    updated_by: "system",
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  },
]

// In-memory storage for users and reset tokens
let users = [...mockUsers]
const resetTokens: Record<string, { userId: string; expires: Date }> = {}

// Helper function to simulate password hashing
// In a real app, use bcrypt or Argon2
const hashPassword = (password: string): string => {
  // This is a placeholder. In a real app, use a proper hashing library
  return `hashed_${password}_with_salt`
}

// Helper function to verify password
const verifyPassword = (password: string, hashedPassword: string): boolean => {
  // This is a placeholder. In a real app, use a proper password verification
  return hashedPassword === `hashed_${password}_with_salt` || hashedPassword === password
}

// Auth service
export const AuthService = {
  // Login function
  login: async (email: string, password: string): Promise<{ user: User; token: string } | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Find user by email
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    // If user not found or password doesn't match, return null
    if (!user || !verifyPassword(password, user.password)) {
      return null
    }

    // Generate a token (in a real app, use JWT or similar)
    const token = uuidv4()

    // Return user info and token
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as "admin" | "citizen",
        created_by: user.created_by,
        updated_by: user.updated_by,
        date_created: user.date_created,
        date_modified: user.date_modified,
      },
      token,
    }
  },

  // Register function
  register: async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ user: User; token: string } | { error: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if email already exists
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: "Email already in use" }
    }

    // Hash password
    const hashedPassword = hashPassword(password)

    // Create new user
    const timestamp = new Date().toISOString()
    const newUser = {
      id: `user-${uuidv4()}`,
      email,
      password: hashedPassword,
      name,
      role: "citizen" as const,
      created_by: "self-registration",
      updated_by: "self-registration",
      date_created: timestamp,
      date_modified: timestamp,
    }

    // Add user to the database
    users = [...users, newUser]

    // Generate a token
    const token = uuidv4()

    // Return user info and token
    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        created_by: newUser.created_by,
        updated_by: newUser.updated_by,
        date_created: newUser.date_created,
        date_modified: newUser.date_modified,
      },
      token,
    }
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Find user by email
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    // If user not found, return false but don't reveal this information
    if (!user) {
      return true // We still return true for security reasons
    }

    // Generate a reset token
    const token = uuidv4()

    // Set expiration to 1 hour from now
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    // Store token
    resetTokens[token] = { userId: user.id, expires }

    // In a real app, send an email with the reset link
    console.log(`Password reset link: /reset-password?token=${token}`)

    return true
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Check if token exists and is valid
    const resetInfo = resetTokens[token]
    if (!resetInfo || new Date() > resetInfo.expires) {
      return false
    }

    // Find user
    const userIndex = users.findIndex((u) => u.id === resetInfo.userId)
    if (userIndex === -1) {
      return false
    }

    // Hash new password
    const hashedPassword = hashPassword(newPassword)

    // Update user's password
    users[userIndex] = {
      ...users[userIndex],
      password: hashedPassword,
      updated_by: "password-reset",
      date_modified: new Date().toISOString(),
    }

    // Remove used token
    delete resetTokens[token]

    return true
  },

  // Verify token (for protected routes)
  verifyToken: async (token: string): Promise<User | null> => {
    // In a real app, verify JWT or session token
    // This is a simplified version for demonstration

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // For demo purposes, we'll just return the current user from ApiService
    // In a real app, you would validate the token and retrieve the associated user
    return ApiService.getCurrentUser()
  },

  // Logout
  logout: async (): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In a real app, invalidate the token or session
    // For this demo, we don't need to do anything
  },
}

