import { redirect } from 'next/navigation';

import { auth } from '@/auth';

export default async function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  const role = user?.role;

  if (role !== 'recruiter' && role !== 'admin') {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}
