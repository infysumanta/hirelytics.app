import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';

import authConfig from './lib/auth.config';

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req: NextRequest) {
  return NextResponse.next(req);
});
