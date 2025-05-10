import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session) {
    redirect('/');
  }
  return (
    <>
      <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>
    </>
  );
}
