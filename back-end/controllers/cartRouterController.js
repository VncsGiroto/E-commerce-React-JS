import Cart from "../models/Cart.js";
import Produto from "../models/Produto.js";
import User from "../models/User.js";

async function create(req, res) {
    try {
        const { quantidade } = req.body;
        
        const user = await User.findById(req.id);
        if (!user) {
            res.status(404).json({ message: "Usuário Não Encontrado" });
            return;
        }
        
        const produto = await Produto.findById(req.body.produto_id);
        if (!produto) {
            res.status(404).json({ message: "Produto Não Encontrado" });
            return;
        }
        
        if (!quantidade || quantidade < 1) {
            res.status(400).json({ message: "Quantidade inválida" });
            return;
        }
        
        const precoNaCompra = produto.preco;
        const valorTotal = precoNaCompra * quantidade;
        
        const novoCart = new Cart({
            userId: req.id,
            items: [
                {
                    produtoId: req.body.produto_id,
                    quantidade: quantidade,
                    precoNaCompra: precoNaCompra
                }
            ],
            valorTotal: valorTotal
        });
        
        await novoCart.save();
        
        res.status(201).json({
            message: "Carrinho criado com sucesso",
            cart: novoCart
        });
    } catch (error) {
        res.status(500).json({ message: "Erro Inesperado" });
        console.log(error);
    }
}

async function getAll(req, res) {
    
}

export default { create };