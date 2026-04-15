import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { Sofa } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="Extra Furniture" icon={<Sofa size={28} />} />
    </AdminLayout>
  );
}
