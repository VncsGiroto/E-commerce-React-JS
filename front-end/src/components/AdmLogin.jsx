import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GetAdminToken from '../functions/admin/GetAdminToken.js';
import CheckAdminToken from '../functions/admin/CheckAdminToken.js';

const AdmLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await CheckAdminToken();
        if (response) {
          navigate('/admin/dashboard', {replace: true}); // Redireciona se já estiver autenticado
        }
      } catch (error) {
        return null
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await GetAdminToken(email, password);
      if(response.status == 200){
        navigate('/admin/dashboard', {replace: true});
      }
      else{
        setError(response.data.message);
      }
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="user"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default AdmLogin;