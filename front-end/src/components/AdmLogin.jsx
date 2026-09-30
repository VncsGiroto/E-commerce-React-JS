import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GetAdminToken from '../functions/admin/GetAdminToken.js';
import CheckAdminToken from '../functions/admin/CheckAdminToken.js';
import { Button, Container, ErrorMessage, FormGroup, FormWrapper, Input, Title } from './authStyles';

const AdmLogin = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await CheckAdminToken();
        if (response) {
          navigate('/admin/dashboard', {replace: true}); // Redireciona se já estiver autenticado
        }
      } catch {
        return null
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!usuario.trim() || !password.trim()) {
      setError('Preencha usuário e senha.');
      return;
    }

    try {
      const response = await GetAdminToken(usuario.trim(), password);
      if(response?.status === 200){
        navigate('/admin/dashboard', {replace: true});
      }
      else{
        setError(response?.data?.message || 'Usuário ou senha incorretos');
      }
    } catch {
      setError('Falha de rede. Tente novamente.');
    }
  };

  if (checking) {
    return (
      <Container>
        <FormWrapper>
          <p>Verificando sessão...</p>
        </FormWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <FormWrapper>
        <Title>Admin</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={handleLogin}>
          <FormGroup>
            <label htmlFor="usuario">Usuário</label>
            <Input
              id="usuario"
              type="text"
              placeholder="admin"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="password">Senha</label>
            <Input
              id="password"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormGroup>
          <Button type="submit">Entrar</Button>
        </form>
      </FormWrapper>
    </Container>
  );
};

export default AdmLogin;
