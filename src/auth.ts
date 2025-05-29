import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

import { UserRole } from '@/models/user';

// Define login schema for validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'recruiter', 'candidate']),
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/login',
    error: '/error',
  },
  session: {
    strategy: 'jwt',
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
      const userRole = user?.role as UserRole | undefined;

      const { pathname } = request.nextUrl;

      // Public routes that don't require authentication
      const publicRoutes = ['/', '/login', '/register', '/learn-more'];
      const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      );

      // If it's a public route and user is logged in, redirect to dashboard
      if (
        isPublicRoute &&
        isLoggedIn &&
        (pathname.startsWith('/login') || pathname.startsWith('/register'))
      ) {
        return Response.redirect(new URL('/dashboard', request.nextUrl));
      }

      // If it's a public route, allow access
      if (isPublicRoute) {
        return true;
      }

      // If user is not logged in, redirect to login
      if (!isLoggedIn) {
        // Store the original URL to redirect back after login
        const redirectUrl = encodeURIComponent(request.nextUrl.pathname);
        return Response.redirect(new URL(`/login?callbackUrl=${redirectUrl}`, request.nextUrl));
      }

      // If user is logged in but account is disabled, redirect to login with error
      if (isLoggedIn && !isActive) {
        return Response.redirect(new URL('/login?error=Account+is+disabled', request.nextUrl));
      }

      // Define role-based access rules
      const adminOnlyRoutes = ['/admin', '/dashboard/admin'];
      const isAdminOnlyRoute = adminOnlyRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      );

      const recruiterOnlyRoutes = ['/dashboard/recruiters', '/jobs/create', '/jobs/manage'];
      const isRecruiterOnlyRoute = recruiterOnlyRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      );

      const candidateOnlyRoutes = ['/dashboard/candidates', '/applications/my'];
      const isCandidateOnlyRoute = candidateOnlyRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      );

      // Admin access check
      if (isAdminOnlyRoute && userRole !== 'admin') {
        return Response.redirect(new URL('/unauthorized', request.nextUrl));
      }

      // Recruiter access check
      if (isRecruiterOnlyRoute && userRole !== 'recruiter' && userRole !== 'admin') {
        return Response.redirect(new URL('/unauthorized', request.nextUrl));
      }

      // Candidate access check
      if (isCandidateOnlyRoute && userRole !== 'candidate' && userRole !== 'admin') {
        return Response.redirect(new URL('/unauthorized', request.nextUrl));
      }

      // Dashboard is accessible to all authenticated and active users
      if (pathname === '/dashboard') {
        return isActive;
      }

      // For any other protected route, require authentication and active account
      return isLoggedIn && isActive;
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          // Validate credentials
          const { email, password, role } = loginSchema.parse(credentials);

          // Make a request to our API route for authentication
          const response = await fetch(`${process.env.AUTH_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, role }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
          }

          return data.user;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
});
