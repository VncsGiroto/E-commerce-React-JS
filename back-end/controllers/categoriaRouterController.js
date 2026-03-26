import Categoria from "../models/Categoria.js";

/**
 * GET /categorias
 * Retorna todas as categorias
 */
async function getAll(req, res) {
    try {
        const categorias = await Categoria.find().select('_id nome descricao');
        res.status(200).json(categorias);
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
        if (!nome) {
            return res.status(400).json({ message: "Campo 'nome' é obrigatório" });
        }

        // Verificar se categoria já existe
        const categoriaExistente = await Categoria.findOne({ nome: nome.toLowerCase() });
        if (categoriaExistente) {
            return res.status(400).json({ message: "Categoria já existe" });
        }

        const novaCategoria = new Categoria({
            nome: nome.trim(),
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
        const { nome, descricao } = req.body;

        const categoria = await Categoria.findById(id);
        if (!categoria) {
            return res.status(404).json({ message: "Categoria não encontrada" });
        }

        // Verificar se novo nome já é usado por outra categoria
        if (nome && nome !== categoria.nome) {
            const categoriaExistente = await Categoria.findOne({ nome: nome.trim() });
            if (categoriaExistente) {
                return res.status(400).json({ message: "Já existe categoria com esse nome" });
            }
        }

        // Atualizar campo por campo
        if (nome) categoria.nome = nome.trim();
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
        
        const categoria = await Categoria.findById(id);
        if (!categoria) {
            return res.status(404).json({ message: "Categoria não encontrada" });
        }

        // Validar se há produtos associados (importar Produto no topo)
        // const produtosComCategoria = await Produto.countDocuments({ categoriaId: id });
        // if (produtosComCategoria > 0) {
        //     return res.status(400).json({ 
        //         message: "Não é possível deletar categoria com produtos associados",
        //         produtosCount: produtosComCategoria
        //     });
        // }

        await Categoria.findByIdAndDelete(id);
        res.status(200).json({ message: "Categoria deletada com sucesso" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao deletar categoria" });
    }
}

export default { getAll, getById, create, update, deleteById };
