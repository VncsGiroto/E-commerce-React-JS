import React from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import Items from "../components/Items";

const HomeContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #fff;
`;

export default function Inicio() {
    return (
        <HomeContainer>
            <Navbar />
            <Items />
        </HomeContainer>
    );
}