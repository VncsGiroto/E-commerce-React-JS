import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Produto from "../models/Produto.js";
import { getPagination, paginatedResponse } from "../middlewares/pagination.js";

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const IDEMPOTENCY_KEY_MAX_LENGTH = 128;

function isValidObjectId(id) {
    return typeof id === "string" && OBJECT_ID_REGEX.test(id);
}

function getIdempotencyKey(req) {
    const key = req.get("X-Idempotency-Key");
    return typeof key === "string" ? key.trim() : "";
}

function formatOrder(order) {
    return {
        _id: order._id,
        cartId: order.cartId,
        items: order.items,
        total: order.total,
        status: order.status,
        idempotencyKey: order.idempotencyKey,
        createdAt: order.createdAt,
    };
}

// Detecta violação da unique de cartId em diferentes drivers:
// keyPattern/keyValue (mongoose) ou nome do índice na mensagem
// (ex.: "index: cartId_1").
function isCartIdConflict(error) {
    if (!error) return false;
    if (error.keyPattern && Object.prototype.hasOwnProperty.call(error.keyPattern, "cartId")) {
        return true;
    }
    if (error.keyValue && typeof error.keyValue === "object" && "cartId" in error.keyValue) {
        return true;
    }
    const indexName = error.index ?? error.indexName;
    if (typeof indexName === "string" && indexName.includes("cartId")) {
        return true;
    }
    const haystack = `${error.message ?? ""} ${error.errmsg ?? ""}`;
    if (haystack.includes("cartId_1")) return true;
    if (/index:\s*cartId\b/.test(haystack)) return true;
    return false;
}

// Mescla itens duplicados do carrinho por produto, somando quantidades.
// Retorna { success, merged } ou { success: false, error } se a soma for inválida.
function mergeCartItems(cartItems) {
    const sums = new Map();
    for (const item of cartItems) {
        const key = String(item.produtoId);
        const qty = Number(item.quantidade);
        sums.set(key, (sums.get(key) ?? 0) + qty);
    }
    for (const [produtoId, quantidade] of sums) {
        if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 999) {
            return {
                success: false,
                error: `Quantidade inválida para produto ${produtoId}: deve ser inteiro entre 1 e 999`,
            };
        }
    }
    return {
        success: true,
        merged: [...sums.entries()].map(([produtoId, quantidade]) => ({ produtoId, quantidade })),
    };
}

function buildOrderItems(mergedItems, products) {
    const items = mergedItems.map((item) => {
        const produto = products.find((p) => p._id.toString() === String(item.produtoId));
        if (!produto) return null;
        const quantidade = item.quantidade;
        const preco = produto.preco;
        return {
            produtoId: produto._id,
            nome: produto.nome,
            quantidade,
            preco,
            subtotal: preco * quantidade,
        };
    });
    if (items.includes(null)) return null;
    const total = items.reduce((acc, item) => acc + item.subtotal, 0);
    return { items, total };
}

// Limpeza pendente: apaga exclusivamente o carrinho que originou o pedido.
async function clearOriginalCart(userId, cartId) {
    if (!cartId) return;
    await Cart.deleteOne({ _id: cartId, userId });
}

async function checkout(req, res) {
    try {
        const idempotencyKey = getIdempotencyKey(req);
        if (!idempotencyKey) {
            return res.status(400).json({ message: "Header X-Idempotency-Key é obrigatório" });
        }
        if (idempotencyKey.length > IDEMPOTENCY_KEY_MAX_LENGTH) {
            return res.status(400).json({ message: "Header X-Idempotency-Key excede 128 caracteres" });
        }

        const existing = await Order.findOne({ userId: req.id, idempotencyKey });
        if (existing) {
            // Replay: conclui limpeza pendente apenas do carrinho original,
            // nunca de um carrinho novo criado depois do pedido.
            await clearOriginalCart(req.id, existing.cartId);
            return res.status(200).json({ message: "Pedido já processado", ...formatOrder(existing) });
        }

        const cart = await Cart.findOne({ userId: req.id });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Carrinho vazio" });
        }

        const merged = mergeCartItems(cart.items);
        if (!merged.success) {
            return res.status(400).json({ message: merged.error });
        }

        const productIds = merged.merged.map((item) => item.produtoId);
        const uniqueIds = [...new Set(productIds.map(String))];
        const products = await Produto.find({ _id: { $in: uniqueIds } });
        if (products.length !== uniqueIds.length) {
            return res.status(404).json({ message: "Um ou mais produtos não foram encontrados" });
        }

        const built = buildOrderItems(merged.merged, products);
        if (!built) {
            return res.status(404).json({ message: "Um ou mais produtos não foram encontrados" });
        }

        let order;
        try {
            order = await Order.create({
                userId: req.id,
                cartId: cart._id,
                idempotencyKey,
                items: built.items,
                total: built.total,
                status: "pago_simulado",
            });
        } catch (error) {
            if (error?.code === 11000) {
                // Corrida idêntica (mesma chave): o pedido vencedor já existe.
                // Buscar primeiro por {userId,idempotencyKey} para retornar
                // replay 200; só se não existir, tratar colisão por cartId como 409.
                const raced = await Order.findOne({ userId: req.id, idempotencyKey });
                if (raced) {
                    await clearOriginalCart(req.id, raced.cartId);
                    return res.status(200).json({ message: "Pedido já processado", ...formatOrder(raced) });
                }
                const isCartConflict = isCartIdConflict(error);
                if (isCartConflict) {
                    // Mesmo carrinho já foi consumido por outro pedido (chave diferente).
                    return res.status(409).json({ message: "Carrinho já foi utilizado em outro pedido" });
                }
            }
            throw error;
        }

        await clearOriginalCart(req.id, cart._id);

        res.status(201).json({ message: "Pedido criado com sucesso", ...formatOrder(order) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao finalizar pedido" });
    }
}

async function list(req, res) {
    try {
        const pagination = getPagination(req.query);
        if (!pagination) {
            const orders = await Order.find({ userId: req.id }).sort({ createdAt: -1 });
            return res.status(200).json({ total: orders.length, pedidos: orders.map(formatOrder) });
        }
        const { page, limit, skip } = pagination;
        const total = await Order.countDocuments({ userId: req.id });
        const orders = await Order.find({ userId: req.id }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const paged = paginatedResponse({ data: orders.map(formatOrder), total, page, limit });
        res.status(200).json({ ...paged, pedidos: paged.data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao listar pedidos" });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "ID de pedido inválido" });
        }
        const order = await Order.findById(id);
        // 404 também quando não é dono, para não revelar existência do pedido.
        if (!order || order.userId.toString() !== String(req.id)) {
            return res.status(404).json({ message: "Pedido não encontrado" });
        }
        res.status(200).json(formatOrder(order));
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao obter pedido" });
    }
}

export default { checkout, list, getById };
