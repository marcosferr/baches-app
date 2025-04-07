import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // Define protected paths and their allowed roles
  const adminPaths = [
    "/admin",
    "/admin/dashboard",
    "/admin/reports",
    "/admin/map",
    "/admin/notifications",
    "/admin/settings",
  ];
  const authPaths = ["/report", "/my-reports", "/notifications", "/profile"];
  const authPages = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  const path = request.nextUrl.pathname;

  // Check if the path is an admin path
  const isAdminPath = adminPaths.some((ap) => path.startsWith(ap));

  // Check if the path is an auth path
  const isAuthPath = authPaths.some((ap) => path === ap);

  // Check if the path is an auth page
  const isAuthPage = authPages.some((ap) => path.startsWith(ap));

  // If the user is trying to access an admin path but is not an admin
  if (isAdminPath && (!isAuthenticated || token?.role !== "admin")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // If the user is trying to access an auth path but is not authenticated
  if (isAuthPath && !isAuthenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and trying to access an auth page
  if (isAuthPage && isAuthenticated) {
    // Redirect admin to admin dashboard, regular users to home
    if (token?.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/admin/:path*",
    "/report",
    "/my-reports",
    "/notifications",
    "/profile",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:path*",
  ],
};
