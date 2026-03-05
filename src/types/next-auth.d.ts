// src/types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    profileId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      profileId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    profileId?: string;
  }
}
