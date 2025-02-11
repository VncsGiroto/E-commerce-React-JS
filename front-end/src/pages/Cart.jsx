import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom"; // Import useNavigate

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
  object-fit: contain;
  background-color: #f0f0f0;
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

const BackButton = styled(Button)`
  background-color: #ff6347;
  margin-bottom: 20px;
  &:hover {
    background-color: #ff4500;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const QuantityButton = styled(Button)`
  width: auto;
  padding: 5px 10px;
  background-color: #007bff;
  &:hover {
    background-color: #0056b3;
  }
`;

const RemoveButton = styled(Button)`
  background-color: #ff6347;
  &:hover {
    background-color: #ff4500;
  }
`;

const TotalPrice = styled.div`
  font-size: 20px;
  font-weight: bold;
  text-align: right;
  margin-top: 20px;
`;

const CheckoutButton = styled(Button)`
  background-color: #28a745;
  &:hover {
    background-color: #218838;
  }
`;

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem("cart")) || [];
    const groupedItems = storedItems.reduce((acc, item) => {
      const found = acc.find(i => i._id === item._id);
      if (found) {
        found.quantity += 1;
      } else {
        acc.push({ ...item, quantity: 1 });
      }
      return acc;
    }, []);
    setCartItems(groupedItems);
  }, []);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.preco * item.quantity, 0);
    setTotalPrice(total);
  }, [cartItems]);

  const handleQuantityChange = (item, delta) => {
    const updatedItems = cartItems.map(cartItem => {
      if (cartItem._id === item._id) {
        return { ...cartItem, quantity: cartItem.quantity + delta };
      }
      return cartItem;
    }).filter(cartItem => cartItem.quantity > 0);
    setCartItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems.flatMap(cartItem => Array(cartItem.quantity).fill(cartItem))));
  };

  const handleRemoveItem = (item) => {
    const updatedItems = cartItems.filter(cartItem => cartItem._id !== item._id);
    setCartItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems.flatMap(cartItem => Array(cartItem.quantity).fill(cartItem))));
  };

  const handleCheckout = () => {
    // Implement checkout logic here
    alert("Compra finalizada com sucesso!");
    localStorage.removeItem("cart");
    setCartItems([]);
    setTotalPrice(0);
  };

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>Voltar</BackButton> {/* Add Back button */}
      <h2>Meu Carrinho</h2>
      <Grid>
        {cartItems.map((item, index) => (
          <Item key={index}>
            <Image src={item.imagem} alt={item.nome} />
            <Info>
              <Title>{item.nome}</Title>
              <Description>{item.descricao}</Description>
              <Price>R$ {parseFloat(item.preco * item.quantity).toFixed(2)}</Price> {/* Update price based on quantity */}
              <QuantityControl>
                <QuantityButton onClick={() => handleQuantityChange(item, -1)}>-</QuantityButton>
                <span>{item.quantity}</span>
                <QuantityButton onClick={() => handleQuantityChange(item, 1)}>+</QuantityButton>
              </QuantityControl>
              <RemoveButton onClick={() => handleRemoveItem(item)}>Remover</RemoveButton>
            </Info>
          </Item>
        ))}
      </Grid>
      <TotalPrice>Total: R$ {totalPrice.toFixed(2)}</TotalPrice> {/* Display total price */}
      <CheckoutButton onClick={handleCheckout}>Finalizar Compra</CheckoutButton>
    </Container>
  );
}
