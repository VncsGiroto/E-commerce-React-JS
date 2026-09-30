import Categoria from "../models/Categoria.js";
import Produto from "../models/Produto.js";
import { getPagination, paginatedResponse } from "../middlewares/pagination.js";

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

function normalizeNome(nome) {
    return nome.trim().toLowerCase();
}

/**
 * GET /categorias
 * Retorna todas as categorias
 */
async function getAll(req, res) {
    try {
        const pagination = getPagination(req.query);
        if (!pagination) {
            const categorias = await Categoria.find().select('_id nome descricao');
            return res.status(200).json(categorias);
        }
        const { page, limit, skip } = pagination;
        const total = await Categoria.countDocuments();
        const categorias = await Categoria.find().select('_id nome descricao').skip(skip).limit(limit);
        res.status(200).json(paginatedResponse({ data: categorias, total, page, limit }));
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao listar categorias" });
    }
}

/**
 * GET /categorias/:id
 * Retorna uma categoria específica pelo ID
 */
async function getById(req, res) {
    try {
        const { id } = req.params;
        if (!OBJECT_ID_REGEX.test(id)) {
            return res.status(400).json({ message: "ID de categoria inválido" });
        }
        const categoria = await Categoria.findById(id);

        if (!categoria) {
            return res.status(404).json({ message: "Categoria não encontrada" });
        }

        res.status(200).json(categoria);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao obter categoria" });
    }
}

/**
 * POST /categorias
 * Cria uma nova categoria (apenas admin)
 */
async function create(req, res) {
    try {
        const { nome, descricao } = req.body;

        // Validar campos obrigatórios
        if (!nome || typeof nome !== 'string' || !nome.trim()) {
            return res.status(400).json({ message: "Campo 'nome' é obrigatório" });
        }
        if (descricao !== undefined && typeof descricao !== 'string') {
            return res.status(400).json({ message: "Campo 'descricao' deve ser um texto" });
        }

        const nomeNormalizado = normalizeNome(nome);

        // Verificar se categoria já existe
        const categoriaExistente = await Categoria.findOne({ nome: nomeNormalizado });
        if (categoriaExistente) {
            return res.status(409).json({ message: "Categoria já existe" });
        }

        const novaCategoria = new Categoria({
            nome: nomeNormalizado,
            descricao: descricao?.trim(),
        });

        await novaCategoria.save();
        res.status(201).json({ message: "Categoria criada com sucesso", categoria: novaCategoria });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao criar categoria" });
    }
}

/**
 * PUT /categorias/:id
 * Atualiza uma categoria existente (apenas admin)
 */
async function update(req, res) {
    try {
        const { id } = req.params;
        if (!OBJECT_ID_REGEX.test(id)) {
            return res.status(400).json({ message: "ID de categoria inválido" });
        }
        const { nome, descricao } = req.body;

        if (descricao !== undefined && typeof descricao !== 'string') {
            return res.status(400).json({ message: "Campo 'descricao' deve ser um texto" });
        }

        const categoria = await Categoria.findById(id);
        if (!categoria) {
            return res.status(404).json({ message: "Categoria não encontrada" });
        }

        // Verificar se novo nome já é usado por outra categoria
        if (nome && typeof nome === 'string' && normalizeNome(nome) !== categoria.nome) {
            const categoriaExistente = await Categoria.findOne({ nome: normalizeNome(nome) });
            if (categoriaExistente) {
                return res.status(409).json({ message: "Já existe categoria com esse nome" });
            }
        }

        // Atualizar campo por campo
        if (nome && typeof nome === 'string' && nome.trim()) categoria.nome = normalizeNome(nome);
        if (descricao !== undefined) categoria.descricao = descricao?.trim();

        await categoria.save();
        res.status(200).json({ message: "Categoria atualizada com sucesso", categoria });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao atualizar categoria" });
    }
}

/**
 * DELETE /categorias/:id
 * Deleta uma categoria (apenas admin)
 * Validação: não permite deletar categoria que tenha produtos
 */
async function deleteById(req, res) {
    try {
        const { id } = req.params;
        if (!OBJECT_ID_REGEX.test(id)) {
            return res.status(400).json({ message: "ID de categoria inválido" });
        }

        const categoria = await Categoria.findById(id);
        if (!categoria) {
            return res.status(404).json({ message: "Categoria não encontrada" });
        }

        const produtosComCategoria = await Produto.countDocuments({ categoriaId: id });
        if (produtosComCategoria > 0) {
            return res.status(409).json({
                message: "Não é possível deletar categoria com produtos associados",
                produtosCount: produtosComCategoria
            });
        }

        await Categoria.findByIdAndDelete(id);
        res.status(200).json({ message: "Categoria deletada com sucesso" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao deletar categoria" });
    }
}

export default { getAll, getById, create, update, deleteById };
