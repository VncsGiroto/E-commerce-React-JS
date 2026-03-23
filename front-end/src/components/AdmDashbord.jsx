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
    min-height: 100vh;
    background-color: #f4f4f4;
`;

const Sidebar = styled.div`
    width: 250px;
    background-color: #2c3e50;
    color: white;
    padding: 20px;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
`;

const Content = styled.div`
    flex: 1;
    padding: 20px;
    margin-left: 250px;
    overflow-y: auto;
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

const Toast = styled.div`
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-size: 14px;
    z-index: 1000;
    animation: slideIn 0.3s ease-in;
    
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    background-color: ${props => props.type === 'success' ? '#27ae60' : props.type === 'error' ? '#e74c3c' : '#3498db'};
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
        height: 200px;
        overflow: hidden;
        border-radius: 10px;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 10px;
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
        margin: 5px;
        &:hover {
            background: #c0392b;
        }
    }
`;

const FormContainer = styled.form`
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;

    label {
        font-weight: 600;
        color: #2c3e50;
        font-size: 14px;
    }
`;

const Input = styled.input`
    padding: 12px;
    border: 2px solid #bdc3c7;
    border-radius: 5px;
    font-size: 14px;
    transition: all 0.3s ease;
    font-family: inherit;

    &:focus {
        outline: none;
        border-color: #1abc9c;
        box-shadow: 0 0 5px rgba(26, 188, 156, 0.3);
    }

    &::placeholder {
        color: #95a5a6;
    }
`;

const FileInput = styled.input`
    padding: 12px;
    border: 2px dashed #bdc3c7;
    border-radius: 5px;
    background: #f8f9fa;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        border-color: #1abc9c;
        background: #f0fffe;
    }

    &:focus {
        outline: none;
        border-color: #1abc9c;
    }
`;

const PreviewContainer = styled.div`
    background: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
    text-align: center;

    p {
        margin: 0 0 10px 0;
        color: #2c3e50;
        font-weight: 600;
    }

    img {
        max-width: 200px;
        max-height: 200px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    flex-wrap: wrap;
`;

const SubmitButton = styled.button`
    padding: 12px 30px;
    background: #1abc9c;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: #16a085;
        box-shadow: 0 4px 8px rgba(26, 188, 156, 0.3);
    }

    &:active {
        transform: scale(0.98);
    }
`;

const CancelButton = styled.button`
    padding: 12px 30px;
    background: #95a5a6;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: #7f8c8d;
        box-shadow: 0 4px 8px rgba(149, 165, 166, 0.3);
    }

    &:active {
        transform: scale(0.98);
    }
`;

const AdmDashbord = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [notification, setNotification] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageChanged, setImageChanged] = useState(false);
    const [newProduct, setNewProduct] = useState({
        nome: '',
        imagem: '',
        descricao: '',
        categoria: '',
        preco: ''
    });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const refetchProducts = async () => {
        try {
            const data = await GetItems();
            setProducts(data);
        } catch (error) {
            console.error("Erro ao buscar produtos", error);
        }
    };

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
        setImagePreview(product.imagem);
        setImageChanged(false);
        setNewProduct({
            nome: product.nome,
            descricao: product.descricao,
            imagem: product.imagem,
            categoria: product.categoria,
            preco: product.preco
        });
    };

    const handleDelete = async (id) => {
        try {
            const response = await DeleteItems(id);
            showNotification(response?.message || "Produto Deletado com sucesso!", 'success');
            await refetchProducts();
        } catch (error) {
            console.error("Erro ao deletar produto", error);
            showNotification(error?.message || "Erro ao deletar produto", 'error');
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
                const base64 = reader.result;
                setImagePreview(base64); // Preview local
                setImageChanged(true);
                setNewProduct({
                    ...newProduct,
                    imagem: base64.split(',')[1], // Envia só o base64
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
                const dataToSend = { ...newProduct };
                // Se a imagem não foi alterada na edição, não envia a imagem
                if (!imageChanged) {
                    delete dataToSend.imagem;
                }
                const updatedProduct = await UpdateItem(editingProduct._id, dataToSend);
                if (updatedProduct.status === 200) {
                    showNotification(updatedProduct?.message || "Produto atualizado com sucesso!", 'success');
                    setEditingProduct(null);
                    setImageChanged(false);
                    await refetchProducts();
                }
            } else {
                // Adicionar novo produto
                const addedProduct = await AddItem(newProduct);
                if (addedProduct.status === 200) {
                    showNotification(addedProduct?.message || "Produto criado com sucesso!", 'success');
                    await refetchProducts();
                }
            }

            // Resetar formulário
            setNewProduct({ nome: '', imagem: '', descricao: '', categoria: '', preco: '' });
            setImagePreview(null);
            setImageChanged(false);

        } catch (error) {
            console.error("Erro ao salvar produto", error);
            showNotification(error?.message || "Erro ao salvar produto", 'error');
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
                <Header>Adicionar, editar ou excluir produtos</Header>
                <FormContainer onSubmit={handleSaveProduct}>
                    <FormGroup>
                        <label>Nome do Produto</label>
                        <Input type="text" name="nome" placeholder="Digite o nome do produto" value={newProduct.nome} onChange={handleChange} required />
                    </FormGroup>

                    <FormGroup>
                        <label>Imagem</label>
                        <FileInput type="file" name="imagem" onChange={handleImageChange} accept="image/*" />
                    </FormGroup>

                    {imagePreview && (
                        <PreviewContainer>
                            <p>Preview da Imagem:</p>
                            <img src={imagePreview} alt="Preview" />
                        </PreviewContainer>
                    )}

                    <FormGroup>
                        <label>Descrição</label>
                        <Input type="text" name="descricao" placeholder="Digite a descrição do produto" value={newProduct.descricao} onChange={handleChange} required />
                    </FormGroup>

                    <FormGroup>
                        <label>Categoria</label>
                        <Input type="text" name="categoria" placeholder="Digite a categoria" value={newProduct.categoria} onChange={handleChange} required />
                    </FormGroup>

                    <FormGroup>
                        <label>Preço (R$)</label>
                        <Input type="number" name="preco" placeholder="0.00" step="0.01" value={newProduct.preco} onChange={handleChange} required />
                    </FormGroup>

                    <ButtonContainer>
                        <SubmitButton type="submit">
                            {editingProduct ? "Atualizar Produto" : "Adicionar Produto"}
                        </SubmitButton>
                        {editingProduct && (
                            <CancelButton type="button" onClick={() => {
                                setEditingProduct(null);
                                setNewProduct({ nome: '', imagem: '', descricao: '', categoria: '', preco: '' });
                                setImagePreview(null);
                                setImageChanged(false);
                            }}>
                                Cancelar Edição
                            </CancelButton>
                        )}
                    </ButtonContainer>
                </FormContainer>

                <h3>Lista de Produtos</h3>
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
            {notification && (
                <Toast type={notification.type}>
                    {notification.message}
                </Toast>
            )}
        </Container>
    );
};

export default AdmDashbord;