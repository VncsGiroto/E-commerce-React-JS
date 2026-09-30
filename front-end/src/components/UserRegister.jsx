import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterUser from '../functions/user/RegisterUser';
import { Button, Container, ErrorMessage, FormGroup, FormWrapper, Input, AuthLink as LoginLink, SuccessMessage, Title } from './authStyles';

const UserRegister = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmSenha, setConfirmSenha] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const navigateTimeout = useRef(null);

    useEffect(() => {
        return () => {
            if (navigateTimeout.current) {
                clearTimeout(navigateTimeout.current);
            }
        };
    }, []);

    const validateForm = () => {
        if (!nome.trim()) {
            setError('Nome é obrigatório');
            return false;
        }
        if (!email.trim()) {
            setError('Email é obrigatório');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Email inválido');
            return false;
        }
        if (senha.length < 6) {
            setError('Senha deve ter no mínimo 6 caracteres');
            return false;
        }
        if (senha !== confirmSenha) {
            setError('As senhas não coincidem');
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await RegisterUser(nome, email, senha);
            
            if (response && (response.status === 200 || response.status === 201)) {
                setSuccess('Conta criada com sucesso! Redirecionando...');
                navigateTimeout.current = setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 2000);
            } else {
                setError(response?.data?.message || 'Erro ao registrar. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao registrar:', error);
            setError('Erro ao registrar. Verifique sua conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <FormWrapper>
                <Title>Criar Conta</Title>

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}

                <form onSubmit={handleRegister}>
                    <FormGroup>
                        <label htmlFor="nome">Nome Completo</label>
                        <Input
                            id="nome"
                            type="text"
                            placeholder="João Silva"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </FormGroup>

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
                        <label htmlFor="senha">Senha</label>
                        <Input
                            id="senha"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <label htmlFor="confirmSenha">Confirmar Senha</label>
                        <Input
                            id="confirmSenha"
                            type="password"
                            placeholder="Confirme sua senha"
                            value={confirmSenha}
                            onChange={(e) => setConfirmSenha(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </FormGroup>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Criando conta...' : 'Registrar'}
                    </Button>
                </form>

                <LoginLink>
                    Já tem conta? <Link to="/login">Faça login</Link>
                </LoginLink>
            </FormWrapper>
        </Container>
    );
};

export default UserRegister;
