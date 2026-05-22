import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    } & import("next-auth").DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  }
}

export const authConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.id) token.id = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (user.role) token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      if (nextUrl.pathname.startsWith("/admin")) {
        return isLoggedIn && role === "ADMIN";
      }
      if (
        nextUrl.pathname.startsWith("/profile") ||
        nextUrl.pathname.startsWith("/cart") ||
        nextUrl.pathname.startsWith("/checkout")
      ) {
        return isLoggedIn;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
