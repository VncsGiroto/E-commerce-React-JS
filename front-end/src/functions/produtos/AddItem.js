import { api } from "../Api";

const AddItem = async (produto) => {
    try {
        const response = await api.post("/criar", {
            nome: produto.nome,
            imagem: produto.imagem,
            descricao: produto.descricao,
            categoria: produto.categoria,
            preco: produto.preco
        });
        return response;
    } catch (error) {
        return error.response
    }

};

export default AddItem;
