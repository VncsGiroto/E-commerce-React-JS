import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GetUserToken from '../functions/user/GetUserToken';
import CheckUserToken from '../functions/user/CheckUserToken';
import { Button, Container, ErrorMessage, FormGroup, FormWrapper, Input, AuthLink as LinkContainer, Title } from './authStyles';

const UserLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await CheckUserToken();
                if (response) {
                    navigate('/', { replace: true });
                }
            } catch {
                return null;
            } finally {
                setChecking(false);
            }
        };
        checkAuth();
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Preencha email e senha.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await GetUserToken(email.trim(), password);
            if (response && response.status === 200) {
                navigate('/', { replace: true });
            } else {
                setError(response?.data?.message || 'Email ou senha incorretos');
            }
        } catch {
            setError('Erro ao fazer login. Tente novamente.');
        } finally {
            setIsLoading(false);
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
                <Title>Bem-vindo de Volta</Title>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <form onSubmit={handleLogin}>
                    <FormGroup>
                        <label htmlFor="email">Email</label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu-email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <label htmlFor="password">Senha</label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </FormGroup>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>

                <LinkContainer>
                    Não tem conta? <Link to="/register">Registre-se aqui</Link>
                </LinkContainer>
            </FormWrapper>
        </Container>
    );
};

export default UserLogin;
