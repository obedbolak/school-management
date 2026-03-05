// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            adminProfile: true,
            teacherProfile: true,
            studentProfile: true,
            parentProfile: true,
          },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) return null;

        let profileId: string | null = null;
        switch (user.role) {
          case "ADMIN":
            profileId = user.adminProfile?.id ?? null;
            break;
          case "TEACHER":
            profileId = user.teacherProfile?.id ?? null;
            break;
          case "STUDENT":
            profileId = user.studentProfile?.id ?? null;
            break;
          case "PARENT":
            profileId = user.parentProfile?.id ?? null;
            break;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileId,
        };
      },
    }),
  ],
});
