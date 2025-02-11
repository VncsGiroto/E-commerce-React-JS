import { messages } from "@vinejs/vine/defaults";
import path from 'path';
import Produto from "../models/Produto.js";
import imageSavingMiddleware from "../middlewares/base64ToImageMiddleware.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, unlinkSync } from 'fs'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getAll(req, res){
    try {
        const produtos = await Produto.find();

        const produtosComImagem = produtos.map(produto => {
            const imagemUrl = `${req.protocol}://${req.get('host')}/static/images/${produto.imagem}`;
            return { 
                ...produto.toObject(), // Converte o documento do MongoDB em um objeto
                imagem: imagemUrl // Substitui a imagem pelo link completo
            };
        });

        res.status(200)
            .json(produtosComImagem);
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
        const { nome, descricao, categoria, preco } = req.body;
        const imagem = req.uuid;

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
        res.status(500)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function deleteId(req, res){
    try {
        const id = req.params.id
        const produto = await Produto.findOne({ _id: id });

        if (!produto) {
            return res.status(404).json({ message: "Produto Não Encontrado" });
        }
        
        const imagePath = path.resolve(__dirname, '..', 'static', 'images', produto.imagem);

        if (existsSync(imagePath)) {
            unlinkSync(imagePath); // Deletando a imagem
        } else {
            console.warn(`Imagem ${produto.imagem} não encontrada, não foi possível deletar.`);
        }

        await Produto.deleteOne({ _id: id });
        res.status(200)
            .json({message: "Produto Deletado", produto});
    } catch (error) {
        res.status(404)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function update(req, res) {
    try {
        const { _id, nome, descricao, categoria, preco } = req.body;
        let novaImagem = req.uuid;

        if (!novaImagem && req.body.imagem) {
            novaImagem = req.body.imagem;
        }

        const produtoAtual = await Produto.findById(_id);
        if (!produtoAtual) {
            return res.status(404).json({ message: "Produto Não Encontrado" });
        }

        // Verificar se a imagem foi atualizada
        if (novaImagem && produtoAtual.imagem !== novaImagem) {
            const antigaImagemPath = join(__dirname, '..', 'static', 'images', produtoAtual.imagem);
            if (existsSync(antigaImagemPath)) {
                unlinkSync(antigaImagemPath); // Deletando a imagem antiga
            } else {
                console.warn(`Imagem antiga ${produtoAtual.imagem} não encontrada, não foi possível deletar.`);
            }
        }

        const update = {
            nome,
            imagem: novaImagem || produtoAtual.imagem, // Certifique-se de usar novaImagem ou manter a antiga
            descricao,
            categoria,
            preco,
        };

        const produtoAtualizado = await Produto.findOneAndUpdate({ _id: _id }, update, { new: true });

        res.status(200).json({ message: "Produto Atualizado", produto: produtoAtualizado });

    } catch (error) {
        res.status(500).json({ message: "Erro Inesperado" });
        console.log(error);
    }
}

export default {getAll, create, getCategoria, deleteId, update};