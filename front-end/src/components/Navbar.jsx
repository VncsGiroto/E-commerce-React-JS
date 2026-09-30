import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import CheckUserToken from "../functions/user/CheckUserToken.js";
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

const UserName = styled.span`
    color: #333;
    font-size: 14px;
    font-weight: 500;
`

export default function Navbar() {
    const [userName, setUserName] = useState(null);

    useEffect(() => {
        const token = Cookies.get('userToken');
        if (token) {
            const validateToken = async () => {
                const response = await CheckUserToken();
                if (response?.status === 200) {
                    setUserName(response?.data?.nome ?? response?.data?.user?.nome ?? null);
                } else {
                    setUserName(null);
                }
            };
            validateToken();
        }
    }, []);

    return (
        <Modelo>
            <Logo src={logo} alt="logo"/>
            <Actions>
                {userName && <UserName>Olá, {userName}</UserName>}
                <ActionButtons to="/cart">Carrinho</ActionButtons>
                <ActionButtons to="/login">Entrar</ActionButtons>
            </Actions>
        </Modelo>
    );
}
