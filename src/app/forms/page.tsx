import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { ClipboardList } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="Forms" icon={<ClipboardList size={28} />} />
    </AdminLayout>
  );
}
