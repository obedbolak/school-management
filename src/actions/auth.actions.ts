// src/actions/auth.actions.ts
"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import prisma from "@/lib/prisma";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Look up the user's role BEFORE signing in
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    // Determine redirect based on role
    let redirectTo = "/dashboard";
    if (user) {
      switch (user.role) {
        case "ADMIN":
          redirectTo = "/dashboard";
          break;
        case "TEACHER":
          redirectTo = "/teacher";
          break;
        case "STUDENT":
          redirectTo = "/student";
          break;
        case "PARENT":
          redirectTo = "/parent";
          break;
      }
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong" };
      }
    }

    // Re-throw to allow Next.js to handle the redirect
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
