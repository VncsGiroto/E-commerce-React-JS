import React, { useEffect, useState } from "react";
import styled from "styled-components";
import LogoutAdmin from "../functions/admin/LogoutAdmin";
import { useNavigate } from 'react-router-dom';
import GetItems from "../functions/produtos/GetItems";
import DeleteItems from "../functions/produtos/DeleteItems";
import AddItem from "../functions/produtos/AddItem";
import UpdateItem from "../functions/produtos/UpdateItem";

const Container = styled.div`
    display: flex;
    height: 100vh;
    background-color: #f4f4f4;
`;

const Sidebar = styled.div`
    width: 250px;
    background-color: #2c3e50;
    color: white;
    padding: 20px;
`;

const Content = styled.div`
    flex: 1;
    padding: 20px;
`;

const Header = styled.div`
    background-color: #34495e;
    padding: 10px 20px;
    color: white;
    font-size: 20px;
    text-align: center;
    margin-bottom: 20px;
`;

const MenuItem = styled.div`
    margin: 15px 0;
    padding: 10px;
    cursor: pointer;
    &:hover {
        background-color: #1abc9c;
    }
`;

const ProductList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 10px;

    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: repeat(1, 1fr);
    }
`;

const ProductCard = styled.div`
    background: white;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    text-align: center;

    .img-wrapper {
        width: 100%;
        height: 200px;       // Tamanho fixo para a imagem
        overflow: hidden;    // Garantir que a imagem não ultrapasse os limites
        border-radius: 10px; // Borda arredondada para a área da imagem
    }

    img {
        width: 100%;         // Largura da imagem 100% do tamanho do card
        height: 100%;        // Altura da imagem 100% do espaço disponível
        object-fit: contain; // Ajuste da imagem sem esticar
        border-radius: 10px; // Garantir que as bordas da imagem também fiquem arredondadas
    }

    h4 {
        margin: 10px 0;
    }

    p {
        font-size: 14px;
        color: #555;
    }

    button {
        background: #e74c3c;
        color: white;
        border: none;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 5px;
        &:hover {
            background: #c0392b;
        }
    }
`;

const AdmDashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        nome: '',
        imagem: '',
        descricao: '',
        categoria: '',
        preco: ''
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await GetItems();
                setProducts(data);
            } catch (error) {
                console.error("Erro ao buscar produtos", error);
            }
        };
        fetchProducts();
    }, []);

    const handleLogout = async () => {
        try {
            const logout = await LogoutAdmin();
            if (logout) {
                navigate('/admin/', { replace: true });
            } else {
                console.error("Erro ao realizar logout!");
            }
        } catch (error) {
            console.error("Falha ao se desconectar:", error);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setNewProduct({
            nome: product.nome,
            imagem: product.imagem,
            descricao: product.descricao,
            categoria: product.categoria,
            preco: product.preco
        });
    };

    const handleDelete = async (id) => {
        try {
            await DeleteItems(id);
            window.alert("Produto Deletado");
            setProducts(products.filter(product => product._id !== id));
        } catch (error) {
            console.error("Erro ao deletar produto", error);
        }
    };

    const handleChange = (e) => {
        setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProduct({
                    ...newProduct,
                    imagem: reader.result.split(',')[1], // Removendo o prefixo "data:image/*;base64,"
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();

        try {
            if (editingProduct) {
                // Atualizar produto existente
                const updatedProduct = await UpdateItem(editingProduct._id, newProduct);
                if (updatedProduct.status === 200) {
                    setProducts(products.map(p =>
                        p._id === editingProduct._id
                            ? { ...p, ...newProduct }  // Mantém a estrutura e atualiza os valores
                            : p
                    ));
                    setEditingProduct(null);
                }
            } else {
                // Adicionar novo produto
                const addedProduct = await AddItem(newProduct);
                if (addedProduct.status === 200) {
                    setProducts([...products, addedProduct.data]);
                }
            }

            // Resetar formulário
            setNewProduct({ nome: '', imagem: '', descricao: '', categoria: '', preco: '' });

        } catch (error) {
            console.error("Erro ao salvar produto", error);
        }
    };

    return (
        <Container>
            <Sidebar>
                <h2>Admin Panel</h2>
                <MenuItem>Produtos</MenuItem>
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Sidebar>
            <Content>
                <Header>Dashboard</Header>
                <p>Bem-vindo ao painel de administração!</p>
                <h3>Lista de Produtos</h3>
                <form onSubmit={handleSaveProduct}>
                    <input type="text" name="nome" placeholder="Nome" value={newProduct.nome} onChange={handleChange} required />
                    <input type="file" name="imagem" onChange={handleImageChange} required />
                    <input type="text" name="descricao" placeholder="Descrição" value={newProduct.descricao} onChange={handleChange} required />
                    <input type="text" name="categoria" placeholder="Categoria" value={newProduct.categoria} onChange={handleChange} required />
                    <input type="number" name="preco" placeholder="Preço" value={newProduct.preco} onChange={handleChange} required />
                    <button type="submit">
                        {editingProduct ? "Atualizar Produto" : "Adicionar Produto"}
                    </button>
                    {editingProduct && (
                        <button type="button" onClick={() => {
                            setEditingProduct(null);
                            setNewProduct({ nome: '', imagem: '', descricao: '', categoria: '', preco: '' }); // Resetando o formulário
                        }}>
                            Cancelar Edição
                        </button>
                    )}
                </form>
                <ProductList>
                    {products.map(product => (
                        <ProductCard key={product._id}>
                            <div className="img-wrapper">
                                <img src={product.imagem} alt={product.nome} />
                            </div>
                            <h4>{product.nome}</h4>
                            <p>{product.descricao}</p>
                            <p>Categoria: {product.categoria}</p>
                            <p>Preço: R$ {product.preco}</p>
                            <button onClick={() => handleDelete(product._id)}>Deletar</button>
                            <button onClick={() => handleEdit(product)}>Editar</button>
                        </ProductCard>
                    ))}
                </ProductList>
            </Content>
        </Container>
    );
};

export default AdmDashboard;
