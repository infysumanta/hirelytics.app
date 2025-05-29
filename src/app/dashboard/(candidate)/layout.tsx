import { redirect } from 'next/navigation';

import { auth } from '@/auth';

export default async function CandidateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  const role = user?.role;

  if (role !== 'candidate' && role !== 'admin') {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}
