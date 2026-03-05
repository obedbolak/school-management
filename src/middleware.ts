// src/middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as any)?.role;
  const isLoggedIn = !!req.auth;

  // Not logged in → send to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin routes
  if (pathname.startsWith("/dashboard") && role !== "ADMIN") {
    const redirectPath =
      role === "TEACHER"
        ? "/teacher"
        : role === "STUDENT"
          ? "/student"
          : role === "PARENT"
            ? "/parent"
            : "/login";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // Teacher routes
  if (pathname.startsWith("/teacher") && role !== "TEACHER") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Student routes
  if (pathname.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Parent routes
  if (pathname.startsWith("/parent") && role !== "PARENT") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/parent/:path*",
  ],
};
