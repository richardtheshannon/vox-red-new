import AdminTopIconBar from '@/components/admin/AdminTopIconBar';
import AdminLeftIconBar from '@/components/admin/AdminLeftIconBar';
import AdminRightIconBar from '@/components/admin/AdminRightIconBar';
import AdminBottomIconBar from '@/components/admin/AdminBottomIconBar';
import AdminMainContent from '@/components/admin/AdminMainContent';

export default function AdminPage() {
  return (
    <>
      <AdminTopIconBar />
      <AdminLeftIconBar />
      <AdminRightIconBar />
      <AdminBottomIconBar />
      <AdminMainContent />
    </>
  );
}