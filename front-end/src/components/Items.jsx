import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import GetItems from "../functions/produtos/GetItems.js";
import CheckUserToken from "../functions/user/CheckUserToken.js";
import { AddToCart } from "../functions/cart/CartApi.js";

// Estilos
const Container = styled.div`
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
`;

const Item = styled.div`
    background-color: #f9f9f9;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
`;

const Image = styled.img`
    width: 100%;
    height: 200px;
    object-fit: contain; /* Ajuste da imagem sem esticar */
    background-color: #f0f0f0; /* Fundo cinza claro para imagens com transparência */
`;

const Info = styled.div`
    padding: 15px;
`;

const Title = styled.h3`
    font-size: 18px;
    color: #333;
    margin: 0 0 10px;
`;

const Description = styled.p`
    font-size: 14px;
    color: #666;
    margin: 0 0 10px;
`;

const Price = styled.span`
    font-size: 16px;
    font-weight: bold;
    color: #000;
`;

const Button = styled.button`
    display: block;
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    background-color: #000;
    color: #fff;
    font-size: 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #444;
    }
`;

const AddToCartButton = styled(Button)`
    background-color: #007bff;
    &:hover {
      background-color: #0056b3;
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
`;

// Componente funcional
export default function Items() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingId, setAddingId] = useState(null);
    const [cartMsg, setCartMsg] = useState(null);

    useEffect(() => {
        const loadItems = async () => {
            try {
                const data = await GetItems();
                setItems(Array.isArray(data) ? data : []);
            } catch (err) {
                setError("Ocorreu um erro ao carregar os itens.");
            } finally {
                setLoading(false);
            }
        };
        loadItems();
    }, []);

    if (loading) {
        return <Container>Carregando itens...</Container>;
    }

    if (error) {
        return <Container>{error}</Container>;
    }

    if (items.length === 0) {
        return <Container>Nenhum item disponível no momento.</Container>;
    }

    const handleAddToCart = async (item) => {
        setCartMsg(null);
        const me = await CheckUserToken();
        const userId = me?.data?._id ?? me?.data?.user?._id ?? null;
        if (me?.status !== 200 || !userId) {
            navigate("/login");
            return;
        }
        setAddingId(item._id);
        const result = await AddToCart(userId, item._id, 1);
        if (result?.cartId || result?.message) {
            setCartMsg(`"${item.nome}" adicionado ao carrinho.`);
        } else {
            setCartMsg(result?.data?.message ?? "Falha ao adicionar ao carrinho.");
        }
        setAddingId(null);
    };

    return (
        <Container>
            {cartMsg && <p>{cartMsg}</p>}
            <Grid>
                {items.map((item) => {
                    const precoNum = parseFloat(item.preco);
                    return (
                    <Item key={item._id}>
                        <Image src={item.imagem} alt={item.nome} />
                        <Info>
                            <Title>{item.nome}</Title>
                            <Description>{item.descricao}</Description>
                            <Price>
                                {Number.isNaN(precoNum)
                                    ? item.preco
                                    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(precoNum)}
                            </Price>
                            <AddToCartButton disabled={addingId === item._id} onClick={() => handleAddToCart(item)}>
                                {addingId === item._id ? "Adicionando..." : "Adicionar ao Carrinho"}
                            </AddToCartButton>
                        </Info>
                    </Item>
                    );
                })}
            </Grid>
        </Container>
    );
}
