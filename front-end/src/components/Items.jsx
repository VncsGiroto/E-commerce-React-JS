import React, { useState, useEffect } from "react";
import styled from "styled-components";
import GetItems from "../functions/produtos/GetItems.js";

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
    object-fit: cover;
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

// Componente funcional
export default function Items() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await GetItems();
        setItems(data);
      } catch (err) {
        setError("Ocorreu um erro ao carregar os itens.");
        return <Container>{error}</Container>;
      } finally {
        setLoading(false);
      }
    };
      loadItems();
    }, []);

    if (loading) {
      return <Container>Carregando itens...</Container>;
    }

    return (
      <Container>
        <Grid>
          {items.map((item) => (
            <Item key={item._id}>
              <Image src={item.imagem} alt={item.nome} />
              <Info>
                <Title>{item.nome}</Title>
                <Description>{item.descricao}</Description>
                <Price>{item.preco}</Price>
                <Button>Comprar</Button>
              </Info>
            </Item>
          ))}
        </Grid>
      </Container>
    );
 
}
