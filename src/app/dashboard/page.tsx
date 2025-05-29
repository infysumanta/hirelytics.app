import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { CandidateDashboard } from '@/components/dashboard/candidate-dashboard';
import { RecruiterDashboard } from '@/components/dashboard/recruiter-dashboard';
import { UserRole } from '@/models/user';

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role as UserRole;

  // Based on user role, render the appropriate dashboard component
  return (
    <div className="container mx-auto py-6">
      {role === 'admin' && <AdminDashboard />}
      {role === 'recruiter' && <RecruiterDashboard />}
      {role === 'candidate' && <CandidateDashboard />}
    </div>
  );
}
