import { api } from "../Api";

export async function GetCart(userId) {
    try {
        const response = await api.get(`/cart/${userId}`);
        return response.data;
    } catch (error) {
        return error.response ?? null;
    }
}

export async function CreateCart(items) {
    try {
        const response = await api.post("/cart/criar", { items });
        return response.data;
    } catch (error) {
        return error.response ?? null;
    }
}

export async function UpdateCart(cartId, items) {
    try {
        const response = await api.put(`/cart/atualizar/${cartId}`, { items });
        return response.data;
    } catch (error) {
        return error.response ?? null;
    }
}

export async function RemoveCartItem(cartId, itemId) {
    try {
        const response = await api.delete(`/cart/${cartId}/item/${itemId}`);
        return response.data;
    } catch (error) {
        return error.response ?? null;
    }
}

export async function DeleteCart(cartId) {
    try {
        const response = await api.delete(`/cart/${cartId}`);
        return response.data;
    } catch (error) {
        return error.response ?? null;
    }
}

// Adiciona um produto ao carrinho do usuário: busca o carrinho existente,
// mescla quantidades e cria/atualiza conforme necessário.
export async function AddToCart(userId, produtoId, quantidade = 1) {
    const existing = await GetCart(userId);
    if (!existing || existing.status === 404) {
        return CreateCart([{ produtoId, quantidade }]);
    }
    if (existing.cartId) {
        const merged = new Map();
        for (const item of existing.items ?? []) {
            const id = String(item.produtoId?._id ?? item.produtoId);
            merged.set(id, (merged.get(id) ?? 0) + Number(item.quantidade ?? 0));
        }
        const key = String(produtoId);
        merged.set(key, (merged.get(key) ?? 0) + Number(quantidade));
        const items = [...merged.entries()].map(([id, qtd]) => ({ produtoId: id, quantidade: qtd }));
        return UpdateCart(existing.cartId, items);
    }
    return existing;
}
