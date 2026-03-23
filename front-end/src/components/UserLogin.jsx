import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import GetUserToken from '../functions/user/GetUserToken';
import CheckUserToken from '../functions/user/CheckUserToken';

const Container = styled.div`
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
    padding: 20px;
`;

const FormWrapper = styled.div`
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 400px;
`;

const Title = styled.h2`
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
    font-size: 28px;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;

    label {
        display: block;
        margin-bottom: 8px;
        color: #2c3e50;
        font-weight: 600;
        font-size: 14px;
    }
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border: 2px solid #bdc3c7;
    border-radius: 5px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.3s ease;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
    }

    &::placeholder {
        color: #95a5a6;
    }
`;

const Button = styled.button`
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 20px;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.p`
    color: #e74c3c;
    background: #fadbd8;
    padding: 12px;
    border-radius: 5px;
    margin-bottom: 20px;
    font-size: 14px;
    border-left: 4px solid #e74c3c;
`;

const LinkContainer = styled.p`
    text-align: center;
    margin-top: 20px;
    color: #7f8c8d;

    a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }
`;

const UserLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await CheckUserToken();
                if (response) {
                    navigate('/', { replace: true });
                }
            } catch (error) {
                return null;
            }
        };
        checkAuth();
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await GetUserToken(email, password);
            if (response && response.status === 200) {
                navigate('/', { replace: true });
            } else {
                setError(response?.data?.message || 'Email ou senha incorretos');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setError('Erro ao fazer login. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

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
                    Não tem conta? <a onClick={() => navigate('/register')}>Registre-se aqui</a>
                </LinkContainer>
            </FormWrapper>
        </Container>
    );
};

export default UserLogin;
