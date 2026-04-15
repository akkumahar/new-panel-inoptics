import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { Type } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="Fascia Name" icon={<Type size={28} />} />
    </AdminLayout>
  );
}
