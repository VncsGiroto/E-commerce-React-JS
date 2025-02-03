import React from "react";
import styled from "styled-components";

const Modelo = styled.div
`
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

const Logo = styled.img
`
    height: 40px;

    @media (max-width: 480px) {
        height: 30px;
    }
    
`

const Nav = styled.nav
`
    display: flex;
    gap: 20px;

    @media (max-width: 768px) {
       display: none;
    }
`

const Ul = styled.ul
`
    display: flex;
    gap: 20px;
    list-style: none;
    margin: 0;
    padding: 0;
`

const Lista = styled.li
`
    text-decoration: none;
    color: #333;
    font-size: 16px;
    font-weight: 500;
    transition: color 0.3s;

    &:hover{
        color: #a8a8a8;
    }
`

const Actions = styled.div
`
    display: flex;
    align-items: center;
    gap: 15px;

    @media (max-width: 768px) {
       gap: 10px;
    }
`

const ActionButtons = styled.a
`
    text-decoration: none;
    color: #333;
    font-size: 18px;
    transition: color 0.3s;
    cursor: pointer;
    
    &:hover{
        color: #000;
    }
`

export default function navbar(){
    const menuItems = ["Home", "Lançamentos", "Masculino", "Feminino", "Ofertas"];

    return <Modelo>
        <Logo src="/src/assets/logo.png" alt="logo"/>
        <Nav>
            <Ul>
                {menuItems.map((item, index) => (
                    <Lista key={index}>{item}</Lista>
                ))}
            </Ul>
        </Nav>
        <Actions>
            <ActionButtons>&#128269;</ActionButtons>
            <ActionButtons>&#128722;</ActionButtons>
            <ActionButtons>Entrar</ActionButtons>
        </Actions>
    </Modelo>
}