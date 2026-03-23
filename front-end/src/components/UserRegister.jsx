import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import RegisterUser from '../functions/user/RegisterUser';

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

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }

    &:active {
        transform: translateY(0);
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

const SuccessMessage = styled.p`
    color: #27ae60;
    background: #d5f4e6;
    padding: 12px;
    border-radius: 5px;
    margin-bottom: 20px;
    font-size: 14px;
    border-left: 4px solid #27ae60;
`;

const LoginLink = styled.p`
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

const UserRegister = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmSenha, setConfirmSenha] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
            setError('As senhas não coincdem');
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
            
            if (response && response.status === 200) {
                setSuccess('Conta criada com sucesso! Redirecionando...');
                setTimeout(() => {
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
                    Já tem conta? <a onClick={() => navigate('/login')}>Faça login</a>
                </LoginLink>
            </FormWrapper>
        </Container>
    );
};

export default UserRegister;
