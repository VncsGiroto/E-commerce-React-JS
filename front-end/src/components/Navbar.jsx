import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import CheckUserToken from "../functions/user/CheckUserToken.js";
import LogoutUser from "../functions/user/LogoutUser.js";
import logo from "../assets/logo.png";

const Modelo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
    }
    
`

const Logo = styled.img`
    height: 40px;

    @media (max-width: 480px) {
        height: 30px;
    }
    
`

const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;

    @media (max-width: 768px) {
       gap: 10px;
    }
`

const ActionButtons = styled(Link)`
    text-decoration: none;
    color: #333;
    font-size: 18px;
    transition: color 0.3s;
    cursor: pointer;
    
    &:hover{
        color: #000;
    }
`

const LogoutButton = styled.button`
    background: none;
    border: none;
    padding: 0;
    color: #333;
    font-size: 18px;
    transition: color 0.3s;
    cursor: pointer;

    &:hover{
        color: #000;
    }
`

const UserName = styled.span`
    color: #333;
    font-size: 14px;
    font-weight: 500;
`

export default function Navbar() {
    const navigate = useNavigate();
    const { userId: ctxUserId, userName: ctxUserName } = useOutletContext() ?? {};
    const [userName, setUserName] = useState(ctxUserId ? (ctxUserName ?? null) : null);
    const [checked, setChecked] = useState(Boolean(ctxUserId));
    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState(null);

    useEffect(() => {
        if (ctxUserId) {
            setUserName(ctxUserName ?? null);
            setChecked(true);
            return;
        }
        const resolveSession = async () => {
            const response = await CheckUserToken();
            if (response?.status === 200) {
                setUserName(response?.data?.nome ?? response?.data?.user?.nome ?? null);
            } else {
                setUserName(null);
            }
            setChecked(true);
        };
        resolveSession();
    }, [ctxUserId, ctxUserName]);

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        setLogoutError(null);
        const response = await LogoutUser();
        if (response?.status === 200) {
            setUserName(null);
            navigate("/", { replace: true });
        } else {
            setLogoutError("Falha ao sair. Tente novamente.");
        }
        setLoggingOut(false);
    };

    return (
        <Modelo>
            <Logo src={logo} alt="logo"/>
            <Actions>
                {checked && (userName ? (
                    <>
                        <UserName>Olá, {userName}</UserName>
                        <ActionButtons to="/cart">Carrinho</ActionButtons>
                        <ActionButtons to="/orders">Meus pedidos</ActionButtons>
                        <LogoutButton type="button" disabled={loggingOut} onClick={handleLogout}>Sair</LogoutButton>
                    </>
                ) : (
                    <>
                        <ActionButtons to="/cart">Carrinho</ActionButtons>
                        <ActionButtons to="/login">Entrar</ActionButtons>
                        <ActionButtons to="/register">Criar conta</ActionButtons>
                    </>
                ))}
                {logoutError && <UserName role="alert">{logoutError}</UserName>}
            </Actions>
        </Modelo>
    );
}
