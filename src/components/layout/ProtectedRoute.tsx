import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth, User } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface Props {
  allowedRoles?: User['role'][];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#16324F] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Checking credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto mb-4 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#172B4D] mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 mb-6">
          This section requires <strong>{allowedRoles.join(' or ')}</strong> privileges. You are currently logged in as a{' '}
          <span className="font-semibold text-[#16324F]">{user.role}</span>.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            to={user.role === 'admin' ? '/admin/dashboard' : `/${user.role}/dashboard`}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-[#16324F] rounded-lg hover:bg-[#102438] transition-colors"
          >
            Go to My {user.role.toUpperCase()} Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-1.5 py-2 px-4 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
