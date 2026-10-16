import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import CheckUserToken from '../functions/user/CheckUserToken.js';

export default function UserProtectedRoute() {
  const [status, setStatus] = useState('checking');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    let alive = true;
    const checkAuth = async () => {
      const me = await CheckUserToken();
      if (!alive) return;
      const id = me?.data?._id ?? me?.data?.user?._id ?? null;
      if (me?.status === 200 && id) {
        setUserId(id);
        setUserName(me?.data?.nome ?? me?.data?.user?.nome ?? null);
        setStatus('ok');
      } else {
        setStatus('unauth');
      }
    };
    checkAuth();
    return () => { alive = false; };
  }, []);

  if (status === 'checking') {
    return <p aria-live="polite">Verificando autenticação...</p>;
  }

  if (status !== 'ok') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ userId, userName }} />;
}
