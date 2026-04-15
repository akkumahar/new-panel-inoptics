import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { UserPlus } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="New Exhibitor Request" icon={<UserPlus size={28} />} />
    </AdminLayout>
  );
}
