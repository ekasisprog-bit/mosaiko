import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/admin/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await verifySession();

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar />
      <div className="flex flex-1 flex-col lg:ml-64">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
