'use server';
import { signIn, signOut } from '@/lib/auth';

export const handleGoogleSignIn = async () => {
  await signIn('google');
};

export const handleSignOut = async () => {
  await signOut();
};
