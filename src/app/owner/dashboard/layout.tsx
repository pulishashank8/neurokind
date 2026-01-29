import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import DashboardShell from '@/components/owner/DashboardShell';

export default async function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect('/owner/login');
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}

