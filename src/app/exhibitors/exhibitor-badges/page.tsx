import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { Award } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="Exhibitor Badges" icon={<Award size={28} />} />
    </AdminLayout>
  );
}
