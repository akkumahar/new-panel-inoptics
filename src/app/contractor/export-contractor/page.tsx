import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { Download } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="Export Contractor" icon={<Download size={28} />} />
    </AdminLayout>
  );
}
