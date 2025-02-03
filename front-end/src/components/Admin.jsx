import React, { useState, useEffect } from "react";
import styled from "styled-components";
import GetItems from "../functions/GetItems";


// Estilos
const AdminContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #000;
  color: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  h2 {
    font-size: 20px;
    margin-bottom: 20px;
  }

  button {
    background: none;
    color: #fff;
    border: 1px solid #fff;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #444;
    }
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const ItemCard = styled.div`
  background-color: #f9f9f9;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  h3 {
    font-size: 18px;
    color: #333;
    margin: 0;
  }

  button {
    padding: 8px;
    font-size: 14px;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &.edit {
      background-color: #007bff;

      &:hover {
        background-color: #0056b3;
      }
    }

    &.delete {
      background-color: #dc3545;

      &:hover {
        background-color: #a71d2a;
      }
    }
  }
`;

const Form = styled.form`
  background-color: #fff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  label {
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }

  input,
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 10px;
    background-color: #000;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #444;
    }
  }
`;

// Componente Admin
export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
  });

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await GetItems();
        setItems(data);
      } catch (err) {
        setError("Erro ao carregar os itens.");
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://fakestoreapi.com/products/${id}`);
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Erro ao deletar item:", err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://fakestoreapi.com/products", form);
      setItems([...items, response.data]);
      setForm({ title: "", description: "", price: "", image: "" });
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
    }
  };

  return (
    <AdminContainer>
      <Sidebar>
        <h2>Admin Panel</h2>
        <button onClick={() => setLoading(!loading)}>Atualizar Itens</button>
        <button>Adicionar Produto</button>
      </Sidebar>

      <MainContent>
        <h1>Gerenciar Produtos</h1>

        {loading ? (
          <p>Carregando itens...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ItemsGrid>
            {items.map((item) => (
              <ItemCard key={item.id}>
                <h3>{item.title}</h3>
                <p>R$ {item.price.toFixed(2)}</p>
                <button className="edit">Editar</button>
                <button className="delete" onClick={() => handleDelete(item.id)}>
                  Excluir
                </button>
              </ItemCard>
            ))}
          </ItemsGrid>
        )}

        <h2>Adicionar Novo Produto</h2>
        <Form onSubmit={handleAddItem}>
          <label>Título</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <label>Descrição</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <label>Preço</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <label>URL da Imagem</label>
          <input
            type="text"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          <button type="submit">Adicionar Produto</button>
        </Form>
      </MainContent>
    </AdminContainer>
  );
}
