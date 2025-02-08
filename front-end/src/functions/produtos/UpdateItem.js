import { api } from "../Api";

const UpdateItem = async (_id, produto) => {
    try {
        const response = await api.put("/update", {
            _id,
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

export default UpdateItem;
