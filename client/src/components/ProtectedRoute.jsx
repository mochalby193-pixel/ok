import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from './Loader';

export const ProtectedRoute = ({
  children,
  allowedRoles = [],
  requireSuperAdmin = false,
  superAdminBlocked = false, // blokir superadmin dari halaman admin biasa
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Superadmin tidak boleh akses halaman admin biasa
  if (superAdminBlocked && user.is_superadmin) {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  // Hanya superadmin yang boleh akses
  if (requireSuperAdmin && !user.is_superadmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Cek role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
