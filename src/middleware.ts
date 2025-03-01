import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path.startsWith("/auth/") ||
    path === "/pricing" ||
    path === "/about" ||
    path === "/contact" ||
    path === "/test-firebase"; // Include test page as public for now

  // Check if the user is authenticated by looking for the Firebase auth cookie
  // Firebase stores auth state in localStorage, but we can use a custom cookie
  // that we set after successful authentication
  const isAuthenticated = request.cookies.has("auth_token");

  // If the path requires authentication and the user is not authenticated,
  // redirect to the sign-in page
  if (!isPublicPath && !isAuthenticated) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(signInUrl);
  }

  // If the user is already authenticated and tries to access auth pages,
  // redirect to the dashboard
  if (isAuthenticated && path.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Otherwise, continue with the request
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes
    // - Static files (images, js, css, etc.)
    // - Favicon
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
