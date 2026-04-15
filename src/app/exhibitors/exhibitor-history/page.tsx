import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { History } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="Exhibitor History" icon={<History size={28} />} />
    </AdminLayout>
  );
}
