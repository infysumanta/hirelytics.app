import { redirect } from 'next/navigation';

import { auth } from '@/auth';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;
  const role = user?.role;

  if (role !== 'admin') {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}
