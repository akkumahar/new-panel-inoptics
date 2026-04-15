import AdminLayout from '@/components/layout/AdminLayout';
import DashboardPage from '@/components/pages/DashboardPage';

export default function Home() {
  return (
    <AdminLayout>
      <DashboardPage />
    </AdminLayout>
  );
}
