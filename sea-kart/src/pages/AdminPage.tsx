import { AdminAuthProvider, useAdminAuth } from '../context/AdminAuthContext';
import AdminLoginView from './AdminLoginView';
import AdminDashboardView from './AdminDashboardView';

const AdminContent = () => {
  const { user, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold">
        Loading Sea Kart Admin Portal...
      </div>
    );
  }

  if (!user) {
    return <AdminLoginView />;
  }

  return <AdminDashboardView />;
};

export default function AdminPage() {
  return (
    <AdminAuthProvider>
      <AdminContent />
    </AdminAuthProvider>
  );
}
