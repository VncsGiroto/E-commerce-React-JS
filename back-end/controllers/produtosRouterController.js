import { messages } from "@vinejs/vine/defaults";
import path from 'path';
import Produto from "../models/Produto.js";
import Categoria from "../models/Categoria.js";
import imageSavingMiddleware from "../middlewares/base64ToImageMiddleware.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, unlinkSync } from 'fs'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getAll(req, res){
    try {
        const produtos = await Produto.find().populate('categoriaId');

        const produtosComImagem = produtos.map(produto => {
            const imagemUrl = `${req.protocol}://${req.get('host')}/static/images/${produto.imagem}`;
            return { 
                ...produto.toObject(), 
                imagem: imagemUrl 
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
        const categoriaId = req.params.categoria;
        
        // Validar se é um ObjectId válido
        if (!categoriaId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({message: "ID de categoria inválido"});
        }
        
        const produtos = await Produto.find({categoriaId: categoriaId}).populate('categoriaId');
        
        if(produtos && produtos.length > 0){
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
        const { nome, descricao, categoriaId, preco } = req.body;
        const imagem = req.uuid;

        // Validar campos obrigatórios
        if (!nome || !descricao || !categoriaId || !preco) {
            return res.status(400).json({message: "Campos obrigatórios: nome, descricao, categoriaId, preco"});
        }

        // Verificar se categoria existe
        const categoria = await Categoria.findById(categoriaId);
        if (!categoria) {
            return res.status(404).json({message: "Categoria não encontrada"});
        }

        const produto = await Produto.findOne({nome: nome});
        if(produto){
            return res.status(400)
                .json({message: "Produto Já Criado"})
        }
        
        const novoProduto = new Produto({
            nome,
            imagem,
            descricao,
            categoriaId,
            preco,
        });
        
        await novoProduto.save();
        const produtoPopulado = await novoProduto.populate('categoriaId');
        
        res.status(201)
            .json(produtoPopulado);
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
            unlinkSync(imagePath); 
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
        const { _id, nome, descricao, categoriaId, preco } = req.body;
        let novaImagem = req.uuid;

        if (!novaImagem && req.body.imagem) {
            novaImagem = req.body.imagem;
        }

        const produtoAtual = await Produto.findById(_id);
        if (!produtoAtual) {
            return res.status(404).json({ message: "Produto Não Encontrado" });
        }

        // Verificar se categoria existe (caso seja alterada)
        if (categoriaId && categoriaId !== produtoAtual.categoriaId.toString()) {
            const categoria = await Categoria.findById(categoriaId);
            if (!categoria) {
                return res.status(404).json({ message: "Categoria não encontrada" });
            }
        }

        // Verificar se a imagem foi atualizada
        if (novaImagem && produtoAtual.imagem !== novaImagem) {
            const antigaImagemPath = join(__dirname, '..', 'static', 'images', produtoAtual.imagem);
            if (existsSync(antigaImagemPath)) {
                unlinkSync(antigaImagemPath); 
            } else {
                console.warn(`Imagem antiga ${produtoAtual.imagem} não encontrada, não foi possível deletar.`);
            }
        }

        const update = {
            ...(nome && { nome }),
            imagem: novaImagem || produtoAtual.imagem, 
            ...(descricao && { descricao }),
            ...(categoriaId && { categoriaId }),
            ...(preco && { preco }),
        };

        const produtoAtualizado = await Produto.findOneAndUpdate({ _id: _id }, update, { new: true }).populate('categoriaId');

        res.status(200).json({ message: "Produto Atualizado", produto: produtoAtualizado });

    } catch (error) {
        res.status(500).json({ message: "Erro Inesperado" });
        console.log(error);
    }
}

export default {getAll, create, getCategoria, deleteId, update};