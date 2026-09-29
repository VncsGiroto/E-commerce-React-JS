import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import CheckAdminToken from '../functions/admin/CheckAdminToken';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
        try {
            const response = await CheckAdminToken();
            setIsAuthenticated(!!response);
        } catch (error) {
            setIsAuthenticated(false);
        }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <p>Verificando autenticação...</p>; // Exibe um loading enquanto verifica
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/" replace />;
};

export default ProtectedRoute;
