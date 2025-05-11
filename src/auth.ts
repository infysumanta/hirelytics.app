import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRole } from "@/models/user";
import { z } from "zod";

// Define login schema for validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "recruiter", "candidate"]),
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/login",
    error: "/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole;
        token.id = user.id;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const user = auth?.user;
      const isLoggedIn = !!user;
      const isActive = user?.isActive !== false; // Consider undefined as active for backward compatibility

      const { pathname } = request.nextUrl;

      // Public routes that don't require authentication
      const publicRoutes = ["/", "/login", "/register"];
      const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      );

      // If it's a public route and user is logged in, redirect to dashboard
      if (
        isPublicRoute &&
        isLoggedIn &&
        (pathname.startsWith("/login") || pathname.startsWith("/register"))
      ) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      // If it's a public route, allow access
      if (isPublicRoute) {
        return true;
      }

      // If user is not logged in, redirect to login
      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", request.nextUrl));
      }

      // If user is logged in but account is disabled, redirect to login with error
      if (isLoggedIn && !isActive) {
        return Response.redirect(
          new URL("/login?error=Account+is+disabled", request.nextUrl),
        );
      }

      // Dashboard is accessible to all authenticated and active users
      if (pathname === "/dashboard") {
        return isActive;
      }

      // For any other protected route, require authentication and active account
      return isLoggedIn && isActive;
    },
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          // Validate credentials
          const { email, password, role } = loginSchema.parse(credentials);

          // Make a request to our API route for authentication
          const response = await fetch(
            `${process.env.AUTH_URL}/api/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password, role }),
            },
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Authentication failed");
          }

          return data.user;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
});
