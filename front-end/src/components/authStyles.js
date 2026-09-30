import styled from 'styled-components';

// Estilos compartilhados das telas de autenticação (login, registro, admin).
// Centraliza Container/Form/Input/Button para evitar três cópias divergentes.

export const Container = styled.div`
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
    padding: 20px;
`;

export const FormWrapper = styled.div`
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 400px;

    @media (max-width: 480px) {
        padding: 24px;
    }
`;

export const Title = styled.h2`
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
    font-size: 28px;
`;

export const FormGroup = styled.div`
    margin-bottom: 20px;

    label {
        display: block;
        margin-bottom: 8px;
        color: #2c3e50;
        font-weight: 600;
        font-size: 14px;
    }
`;

export const Input = styled.input`
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

export const Button = styled.button`
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

export const ErrorMessage = styled.p`
    color: #e74c3c;
    background: #fadbd8;
    padding: 12px;
    border-radius: 5px;
    margin-bottom: 20px;
    font-size: 14px;
    border-left: 4px solid #e74c3c;
`;

export const SuccessMessage = styled.p`
    color: #27ae60;
    background: #d5f4e6;
    padding: 12px;
    border-radius: 5px;
    margin-bottom: 20px;
    font-size: 14px;
    border-left: 4px solid #27ae60;
`;

export const AuthLink = styled.p`
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
