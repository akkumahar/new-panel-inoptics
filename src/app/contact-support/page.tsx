import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { Phone } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="Contact Support" icon={<Phone size={28} />} />
    </AdminLayout>
  );
}
