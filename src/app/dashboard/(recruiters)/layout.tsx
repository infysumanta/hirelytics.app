import { auth } from "@/auth";

export default async function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  const role = user?.role;

  if (role !== "recruiter") {
    return <div>Unauthorized</div>;
  }

  return <>{children}</>;
}
