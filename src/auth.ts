import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/user';
import bcrypt from 'bcryptjs';
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
  signOut
} = NextAuth({
  pages: {
    signIn: '/login',
    error: '/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const user = auth?.user;
      const isLoggedIn = !!user;
      
      const { pathname } = request.nextUrl;
      
      // Public routes - allow access
      if (
        pathname === '/' || 
        pathname.startsWith('/login') || 
        pathname.startsWith('/register')
      ) {
        return true;
      }
      
      // Protected routes - check role-based access
      if (pathname.startsWith('/admin') && user?.role !== 'admin') {
        return false;
      }
      
      if (pathname.startsWith('/recruiter') && user?.role !== 'recruiter') {
        return false;
      }
      
      if (pathname.startsWith('/candidate') && user?.role !== 'candidate') {
        return false;
      }
      
      // For any other protected route, require authentication
      return isLoggedIn;
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
        try {
          // Validate credentials
          const { email, password, role } = loginSchema.parse(credentials);
          
          // Connect to database
          await connectToDatabase();
          
          // Find user by email and role
          const user = await User.findOne({ email, role }).select('+password');
          
          if (!user) {
            throw new Error('Invalid email or password');
          }
          
          // Check password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          
          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
});
