import Cart from "../models/Cart.js";
import Produto from "../models/Produto.js";
import User from "../models/User.js";

/**
 * Validação de integridade: Verifica se todos os produtos existem no banco
 * Retorna array com produtos validados ou null em caso de erro
 */
async function validateProducts(items) {
    const productIds = items.map(item => item.produtoId);
    const products = await Produto.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
        const foundIds = products.map(p => p._id.toString());
        const missingIds = productIds.filter(id => !foundIds.includes(id.toString()));
        return {
            valid: false,
            missingIds: missingIds
        };
    }

    return { valid: true, products };
}

/**
 * Calcula o carrinho com base nos dados atuais do banco (Fonte da Verdade)
 * Ignora valores enviados pelo front-end e usa apenas IDs e quantidades
 */
async function calculateCartTotal(items, products) {
    let totalValue = 0;
    const calculatedItems = [];

    for (const item of items) {
        const produto = products.find(p => p._id.toString() === item.produtoId.toString());

        if (!produto) continue;

        const quantidade = parseInt(item.quantidade) || 0;
        if (quantidade < 1) {
            return {
                success: false,
                error: `Quantidade inválida para produto ${produto.nome}`
            };
        }

        const precoUnitario = produto.preco;
        const subtotal = precoUnitario * quantidade;

        calculatedItems.push({
            produtoId: produto._id,
            nome: produto.nome,
            quantidade: quantidade,
            precoNaCompra: precoUnitario,
            subtotal: subtotal
        });

        totalValue += subtotal;
    }

    return {
        success: true,
        items: calculatedItems,
        valorTotal: totalValue,
        quantidadeItens: calculatedItems.length
    };
}

/**
 * POST /cart/criar
 * Cria um novo carrinho com validação de integridade
 * O front-end envia apenas IDs e quantidades
 */
async function create(req, res) {
    try {
        const { items } = req.body;

        // Verificar usuário
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({ message: "Usuário Não Encontrado" });
        }

        // Validar que items foi enviado
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Campo 'items' deve ser um array não vazio" });
        }

        // Validação de integridade: todos os produtos existem?
        const validation = await validateProducts(items);
        if (!validation.valid) {
            return res.status(404).json({
                message: "Um ou mais produtos não foram encontrados",
                missingProductIds: validation.missingIds
            });
        }

        // Calcular carrinho com preços do banco (Fonte da Verdade)
        const calculation = await calculateCartTotal(items, validation.products);
        if (!calculation.success) {
            return res.status(400).json({ message: calculation.error });
        }

        // Criar novo carrinho
        const novoCart = new Cart({
            userId: req.id,
            items: calculation.items,
            valorTotal: calculation.valorTotal
        });

        await novoCart.save();

        res.status(201).json({
            message: "Carrinho criado com sucesso",
            cartId: novoCart._id,
            items: calculation.items,
            valorTotal: calculation.valorTotal,
            quantidadeItens: calculation.quantidadeItens
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao criar carrinho" });
    }
}

/**
 * GET /cart/:userId
 * Obtém o carrinho de um usuário específico
 */
async function getByUserId(req, res) {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: "Carrinho não encontrado para este usuário" });
        }

        res.status(200).json({
            message: "Carrinho obtido com sucesso",
            cartId: cart._id,
            userId: cart.userId,
            items: cart.items,
            valorTotal: cart.valorTotal,
            quantidadeItens: cart.items.length,
            data: cart.dataDaCompra
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao obter carrinho" });
    }
}

/**
 * PUT /cart/atualizar/:cartId
 * Atualiza o carrinho recalculando preços com dados atuais do banco
 * Implementa o princípio: "cliente propõe, servidor dita o preço"
 */
async function updateCart(req, res) {
    try {
        const { cartId } = req.params;
        const { items } = req.body;

        // Validar items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Campo 'items' deve ser um array não vazio" });
        }

        // Verificar se carrinho existe
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Carrinho não encontrado" });
        }

        // Validação de integridade
        const validation = await validateProducts(items);
        if (!validation.valid) {
            return res.status(404).json({
                message: "Um ou mais produtos não foram encontrados",
                missingProductIds: validation.missingIds
            });
        }

        // Recalcular com preços atuais do banco
        const calculation = await calculateCartTotal(items, validation.products);
        if (!calculation.success) {
            return res.status(400).json({ message: calculation.error });
        }

        // Atualizar carrinho
        cart.items = calculation.items;
        cart.valorTotal = calculation.valorTotal;
        await cart.save();

        res.status(200).json({
            message: "Carrinho atualizado com sucesso",
            cartId: cart._id,
            items: calculation.items,
            valorTotal: calculation.valorTotal,
            quantidadeItens: calculation.quantidadeItens
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao atualizar carrinho" });
    }
}

/**
 * DELETE /cart/:cartId/item/:itemId
 * Remove um item específico do carrinho
 */
async function removeItem(req, res) {
    try {
        const { cartId, itemId } = req.params;

        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Carrinho não encontrado" });
        }

        const itemIndex = cart.items.findIndex(item => item.produtoId.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item não encontrado neste carrinho" });
        }

        const removedItem = cart.items[itemIndex];
        cart.items.splice(itemIndex, 1);
        // Recalculate total from remaining items to avoid NaN issues
        cart.valorTotal = cart.items.reduce((total, item) => total + (item.subtotal || 0), 0);

        await cart.save();

        res.status(200).json({
            message: "Item removido com sucesso",
            removedItem: removedItem,
            items: cart.items,
            valorTotal: cart.valorTotal,
            quantidadeItens: cart.items.length
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao remover item" });
    }
}

/**
 * POST /cart/recalcular/:cartId
 * Recalcula o carrinho com preços atuais do banco
 * Útil quando há mudanças de preço após criação do carrinho
 */
async function recalculateCart(req, res) {
    try {
        const { cartId } = req.params;

        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Carrinho não encontrado" });
        }

        if (cart.items.length === 0) {
            return res.status(400).json({ message: "Carrinho vazio" });
        }

        // Buscar produtos atualizados do banco
        const productIds = cart.items.map(item => item.produtoId);
        const products = await Produto.find({ _id: { $in: productIds } });

        if (products.length !== productIds.length) {
            return res.status(404).json({ message: "Um ou mais produtos não existem mais" });
        }

        // Recalcular com novos preços
        const items = cart.items.map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade
        }));

        const calculation = await calculateCartTotal(items, products);
        if (!calculation.success) {
            return res.status(400).json({ message: calculation.error });
        }

        // Verificar se houve mudanças de preço
        const priceChanges = [];
        for (const newItem of calculation.items) {
            const oldItem = cart.items.find(item => item.produtoId.toString() === newItem.produtoId.toString());
            if (oldItem && oldItem.precoNaCompra !== newItem.precoNaCompra) {
                priceChanges.push({
                    nome: newItem.nome,
                    precoAnterior: oldItem.precoNaCompra,
                    precoAtual: newItem.precoNaCompra,
                    diferenca: newItem.precoNaCompra - oldItem.precoNaCompra
                });
            }
        }

        // Atualizar carrinho
        cart.items = calculation.items;
        cart.valorTotal = calculation.valorTotal;
        await cart.save();

        res.status(200).json({
            message: "Carrinho recalculado com sucesso",
            cartId: cart._id,
            items: calculation.items,
            valorTotal: calculation.valorTotal,
            quantidadeItens: calculation.quantidadeItens,
            mudancasDePreco: priceChanges,
            houveMudancas: priceChanges.length > 0
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao recalcular carrinho" });
    }
}

/**
 * DELETE /cart/:cartId
 * Remove completamente um carrinho
 */
async function deleteCart(req, res) {
    try {
        const { cartId } = req.params;

        const cart = await Cart.findByIdAndDelete(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Carrinho não encontrado" });
        }

        res.status(200).json({
            message: "Carrinho removido com sucesso",
            cartId: cart._id
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao deletar carrinho" });
    }
}

/**
 * GET /cart/
 * Lista todos os carrinhos (apenas admin)
 */
async function getAll(req, res) {
    try {
        const carts = await Cart.find();

        res.status(200).json({
            message: "Carrinhos obtidos com sucesso",
            total: carts.length,
            carrinhos: carts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao listar carrinhos" });
    }
}

export default {
    create,
    getByUserId,
    updateCart,
    removeItem,
    recalculateCart,
    deleteCart,
    getAll
};