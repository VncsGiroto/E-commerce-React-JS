import React, { useState } from 'react';
import axios from 'axios';
import AdminLogin from '../functions/AdminLogin';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await AdminLogin(email, password);
      // Armazenar token no cookie HTTP-only
      onLoginSuccess(response.data);
    } catch (err) {
      setError('Credenciais inválidas');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
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
      <p><a href="/forgot-password">Esqueceu a senha?</a></p>
      <p><a href="/register">Criar conta</a></p>
    </div>
  );
};

export default Login;