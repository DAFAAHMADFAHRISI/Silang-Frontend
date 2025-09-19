import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Simpan halaman saat ini sebagai halaman terakhir yang valid
  useEffect(() => {
    if (token && role && allowedRoles.includes(role)) {
      localStorage.setItem(`lastValidPage_${role}`, location.pathname);
    }
  }, [location.pathname, token, role, allowedRoles]);

  useEffect(() => {
    // Jika role tidak ada atau tidak diizinkan, coba redirect ke halaman terakhir yang valid
    if (token && role && !allowedRoles.includes(role)) {
      // Ambil halaman terakhir yang valid berdasarkan role
      const lastValidPage = localStorage.getItem(`lastValidPage_${role}`);
      
      if (lastValidPage) {
        // Redirect ke halaman terakhir yang valid
        navigate(lastValidPage, { replace: true });
      } else {
        // Jika tidak ada halaman terakhir, redirect ke dashboard yang sesuai
        switch (role) {
          case 'siswa':
            navigate('/DashboardSiswa', { replace: true });
            break;
          case 'mentor':
            navigate('/mentor/dashboard', { replace: true });
            break;
          case 'guru':
            navigate('/guru/dashboard', { replace: true });
            break;
          case 'superadmin':
            navigate('/DashboardSuperAdmin', { replace: true });
            break;
          default:
            navigate('/Login', { replace: true });
            break;
        }
      }
    }
  }, [token, role, allowedRoles, navigate]);

  // Jika tidak ada token, redirect ke login
  if (!token) {
    return <Navigate to="/Login" replace />;
  }

  // Jika role tidak ada atau tidak diizinkan, return null (akan redirect via useEffect)
  if (!role || !allowedRoles.includes(role)) {
    return null;
  }

  // Jika role diizinkan, render children
  return <>{children}</>;
};

export default ProtectedRoute;