import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { Zap } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="Exhibitor Power" icon={<Zap size={28} />} />
    </AdminLayout>
  );
}
