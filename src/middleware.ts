import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/app(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    // Hide /dev/* routes in production
    const url = req.nextUrl ?? new URL(req.url);
    if (process.env.NODE_ENV === "production" && url.pathname.startsWith("/dev")) {
      return NextResponse.redirect(new URL("/", url.origin));
    }
    if (isProtectedRoute(req)) await auth.protect();
  },
  {
    signInUrl: "/login",
    signUpUrl: "/signup",
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
