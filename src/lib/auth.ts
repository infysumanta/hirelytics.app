import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import NextAuth, { NextAuthConfig } from "next-auth";

import authConfig from "./auth.config";
import clientPromise from "./mongodb";

const adapter = MongoDBAdapter(clientPromise);

const nextAuthConfig: NextAuthConfig = {
  debug: process.env.NODE_ENV === "development",
  adapter: adapter,
  pages: {
    signIn: "/sign-in",
    // signOut: '/sign-out',
    error: "error",
  },
  callbacks: {
    session({ session }) {
      return {
        ...session,
      };
    },
  },
  session: { strategy: "jwt" },
  ...authConfig,
};

export const { handlers, signIn, signOut, auth } = NextAuth(nextAuthConfig);
