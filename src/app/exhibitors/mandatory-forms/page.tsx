import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { FileText } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="Exhibitor Mandatory Forms" icon={<FileText size={28} />} />
    </AdminLayout>
  );
}
