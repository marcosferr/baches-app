import { NextResponse } from "next/server"

// In a real app, this would be stored in a database with expiration times
const resetTokens = new Map<string, { email: string; expires: Date }>()

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Generate a reset token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Set expiration to 1 hour from now
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    // Store token
    resetTokens.set(token, { email, expires })

    // In a real app, send an email with the reset link
    console.log(`Password reset link: /reset-password?token=${token}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}

// Export a function to validate tokens (to be used in the reset API route)
export const validateResetToken = (token: string) => {
  const resetInfo = resetTokens.get(token)

  if (!resetInfo || new Date() > resetInfo.expires) {
    return null
  }

  return resetInfo.email
}

