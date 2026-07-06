import "next-auth/jwt";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/drizzle";

import { users } from "./db/schema";

const CredentialsSchema = z.object({
  email: z.email(),
  password: z.string(),
});

declare module "next-auth/jwt" {
  /*
   * The shape of the custom JWT token.
   */
  interface JWT {
    id: string | undefined;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = CredentialsSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        const query = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        const user = query[0];
        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
          return null;
        }

        return user;
      },
    }),
    GitHub({
      // `allowDangerousEmailAccountLinking: true` is required to allow a user to sign in
      // with GitHub after they have already signed in with Google using the same email.
      // NextAuth prevents this by default to avoid account hijacking.
      // Read more: https://authjs.dev/reference/core/providers#allowdangerousemailaccountlinking
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      // Allow signing in with Google if an account already exists with the same email
      // (e.g., if the user previously signed up via GitHub).
      // Read more: https://authjs.dev/reference/core/providers#allowdangerousemailaccountlinking
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        token.id = user.id;
      }
      return token;
    },
  },
});
