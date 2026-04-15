import AdminLayout from '@/components/layout/AdminLayout';
import GenericPage from '@/components/pages/GenericPage';
import { BookOpen } from 'lucide-react';

export default function Page() {
  return (
    <AdminLayout>
      <GenericPage title="Masters" icon={<BookOpen size={28} />} />
    </AdminLayout>
  );
}
