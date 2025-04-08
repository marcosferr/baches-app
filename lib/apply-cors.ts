import { NextRequest, NextResponse } from "next/server";

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin":
    process.env.CORS_ALLOWED_ORIGIN ||
    (process.env.NODE_ENV === "production"
      ? process.env.NEXTAUTH_URL || "https://your-production-domain.com"
      : "http://localhost:3000"),
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400", // 24 hours in seconds
};

/**
 * Apply CORS headers to a response
 * @param response The NextResponse object
 * @returns The response with CORS headers
 */
export function applyCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Handle OPTIONS requests for CORS preflight
 * @returns A 204 response with CORS headers
 */
export function handleCorsPreflightRequest(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * Apply CORS to a route handler
 * @param handler The route handler function
 * @returns A wrapped handler function with CORS support
 */
export function withCors(
  handler: (req: NextRequest, params?: any) => Promise<NextResponse>
) {
  return async function corsHandler(
    req: NextRequest,
    params?: any
  ): Promise<NextResponse> {
    // Handle OPTIONS request for CORS preflight
    if (req.method === "OPTIONS") {
      return handleCorsPreflightRequest();
    }

    // Call the original handler
    const response = await handler(req, params);

    // Apply CORS headers to the response
    return applyCorsHeaders(response);
  };
}
