import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { Tag } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="Promotes Your Brands" icon={<Tag size={28} />} />
    </AdminLayout>
  );
}
