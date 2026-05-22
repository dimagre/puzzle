import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authorizeWithCredentials } from "@/lib/auth/credentials";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeWithCredentials,
    }),
  ],
});
