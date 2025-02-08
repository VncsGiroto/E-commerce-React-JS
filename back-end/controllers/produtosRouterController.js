import { messages } from "@vinejs/vine/defaults";
import Produto from "../models/Produto.js";

async function getAll(req, res){
    try {
        const produtos = await Produto.find();
        res.status(200)
            .json(produtos);
    } catch (error) {
        res.status(404)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function getCategoria(req, res){
    try {
        const categoria = req.params.categoria
        const produtos = await Produto.find({categoria: categoria});
        if(produtos){
            res.status(200)
                .json({message: produtos});
        }
        else{
            res.status(404)
                .json({message: "Produto Não Encontrado"})
        }
    } catch (error) {
        res.status(404)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function create(req,res){
    try {
        const { nome, imagem, descricao, categoria, preco } = req.body;
        const produto = await Produto.findOne({nome: nome});
        if(produto){
            res.status(404)
                .json({message: "Produto Já Criado"})
            return
        }
        const novoProduto = new Produto({
            nome,
            imagem,
            descricao,
            categoria,
            preco,
        });
        await novoProduto.save()
        res.status(200)
            .json(novoProduto);
    } catch (error) {
        res.status(404)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function deleteId(req, res){
    try {
        const id = req.params.id
        const produto = await Produto.findOneAndDelete({_id: id});
        res.status(200)
            .json({message: "Produto Deletado", produto});
    } catch (error) {
        res.status(404)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function update(req,res){
    try {
        const { _id, nome, imagem, descricao, categoria, preco } = req.body;
        const update = {
            nome,
            imagem,
            descricao,
            categoria,
            preco,
        };
        const produto = await Produto.findOneAndUpdate({_id: _id, update})
        if(produto){
            res.status(200)
                .json({message: "Produto Autalizado", produto});
        }
        else{
            res.status(404)
                .json({message: "Produto Não Encontrado"})
        }
        
    } catch (error) {
        res.status(404)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

export default {getAll, create, getCategoria, deleteId, update};