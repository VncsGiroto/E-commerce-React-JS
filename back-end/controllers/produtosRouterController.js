import Produto from "../models/Produto.js";
import Categoria from "../models/Categoria.js";
import { saveBase64Image, deleteImageFile } from "../middlewares/base64ToImageMiddleware.js";

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

function toAbsoluteImageUrl(req, produtoDoc) {
    const obj = produtoDoc.toObject ? produtoDoc.toObject() : { ...produtoDoc };
    if (obj.imagem && !String(obj.imagem).startsWith('http')) {
        obj.imagem = `${req.protocol}://${req.get('host')}/static/images/${obj.imagem}`;
    }
    return obj;
}

function isValidObjectId(id) {
    return typeof id === 'string' && OBJECT_ID_REGEX.test(id);
}

async function getAll(req, res){
    try {
        const produtos = await Produto.find().populate('categoriaId');

        const produtosComImagem = produtos.map(produto => toAbsoluteImageUrl(req, produto));

        res.status(200)
            .json(produtosComImagem);
    } catch (error) {
        res.status(500)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function getCategoria(req, res){
    try {
        const categoriaId = req.params.categoria;

        // Validar se é um ObjectId válido
        if (!isValidObjectId(categoriaId)) {
            return res.status(400).json({message: "ID de categoria inválido. Esperado um ObjectId de 24 caracteres hexadecimais."});
        }

        const produtos = await Produto.find({categoriaId: categoriaId}).populate('categoriaId');

        if(produtos && produtos.length > 0){
            res.status(200)
                .json({message: produtos.map(p => toAbsoluteImageUrl(req, p))});
        }
        else{
            res.status(404)
                .json({message: "Produto Não Encontrado"})
        }
    } catch (error) {
        res.status(500)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function create(req,res){
    let savedFilename = null;
    try {
        const { nome, descricao, categoriaId, preco, imagem } = req.body;

        // Validar campos obrigatórios (permite preco 0)
        if (!nome || !descricao || !categoriaId || preco == null || !imagem) {
            return res.status(400).json({message: "Campos obrigatórios: nome, imagem, descricao, categoriaId, preco"});
        }
        if (!isValidObjectId(categoriaId)) {
            return res.status(400).json({message: "categoriaId inválido"});
        }

        // Validar categoria e duplicata ANTES de salvar a imagem
        const categoria = await Categoria.findById(categoriaId);
        if (!categoria) {
            return res.status(404).json({message: "Categoria não encontrada"});
        }

        const produto = await Produto.findOne({nome: nome});
        if(produto){
            return res.status(409)
                .json({message: "Produto Já Criado"})
        }

        // Só agora salva a imagem (evita arquivo órfão)
        try {
            savedFilename = await saveBase64Image(imagem);
        } catch (imgErr) {
            return res.status(imgErr.status || 400).json({ message: imgErr.message || "Imagem inválida" });
        }

        const novoProduto = new Produto({
            nome,
            imagem: savedFilename,
            descricao,
            categoriaId,
            preco,
        });

        try {
            await novoProduto.save();
        } catch (saveErr) {
            // Limpa arquivo órfão se o save falhar
            await deleteImageFile(savedFilename);
            throw saveErr;
        }
        const produtoPopulado = await novoProduto.populate('categoriaId');

        res.status(201)
            .json(toAbsoluteImageUrl(req, produtoPopulado));
    } catch (error) {
        if (savedFilename) {
            await deleteImageFile(savedFilename);
        }
        res.status(500)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function deleteId(req, res){
    try {
        const id = req.params.id
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "ID de produto inválido" });
        }
        const produto = await Produto.findOne({ _id: id });

        if (!produto) {
            return res.status(404).json({ message: "Produto Não Encontrado" });
        }

        await deleteImageFile(produto.imagem);

        await Produto.deleteOne({ _id: id });
        res.status(200)
            .json({message: "Produto Deletado", produto: toAbsoluteImageUrl(req, produto)});
    } catch (error) {
        res.status(500)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function update(req, res) {
    let newSavedFilename = null;
    try {
        const { _id, nome, descricao, categoriaId, preco } = req.body;

        // _id obrigatório e válido
        if (!_id) {
            return res.status(400).json({ message: "Campo '_id' é obrigatório" });
        }
        if (!isValidObjectId(_id)) {
            return res.status(400).json({ message: "ID de produto inválido" });
        }
        if (categoriaId !== undefined && !isValidObjectId(categoriaId)) {
            if (newSavedFilename) await deleteImageFile(newSavedFilename);
            if (req.uuid) await deleteImageFile(req.uuid);
            return res.status(400).json({ message: "categoriaId inválido" });
        }

        const produtoAtual = await Produto.findById(_id);
        if (!produtoAtual) {
            if (req.uuid) await deleteImageFile(req.uuid);
            return res.status(404).json({ message: "Produto Não Encontrado" });
        }

        // Verificar se categoria existe (caso seja alterada)
        if (categoriaId && categoriaId !== produtoAtual.categoriaId.toString()) {
            const categoria = await Categoria.findById(categoriaId);
            if (!categoria) {
                if (req.uuid) await deleteImageFile(req.uuid);
                return res.status(404).json({ message: "Categoria não encontrada" });
            }
        }

        // NUNCA persistir req.body.imagem crua (path traversal):
        // só aceita filename gerado pelo middleware (req.uuid); sem imagem nova, mantém a antiga.
        let imagemFinal = produtoAtual.imagem;
        if (req.uuid) {
            newSavedFilename = req.uuid;
            imagemFinal = req.uuid;
        }

        // Se houve upload de imagem nova e ela difere da antiga, remove a antiga
        if (newSavedFilename && produtoAtual.imagem !== newSavedFilename) {
            await deleteImageFile(produtoAtual.imagem);
        }

        const update = {
            ...(nome !== undefined && { nome }),
            imagem: imagemFinal,
            ...(descricao !== undefined && { descricao }),
            ...(categoriaId !== undefined && { categoriaId }),
            ...(preco !== undefined && { preco }),
        };

        const produtoAtualizado = await Produto.findOneAndUpdate({ _id: _id }, update, { new: true, runValidators: true }).populate('categoriaId');

        res.status(200).json({ message: "Produto Atualizado", produto: toAbsoluteImageUrl(req, produtoAtualizado) });

    } catch (error) {
        if (newSavedFilename) {
            await deleteImageFile(newSavedFilename);
        }
        res.status(500).json({ message: "Erro Inesperado" });
        console.log(error);
    }
}

export default {getAll, create, getCategoria, deleteId, update};
