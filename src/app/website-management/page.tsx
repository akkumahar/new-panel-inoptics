import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { Globe } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="Website Management" icon={<Globe size={28} />} />
    </AdminLayout>
  );
}
