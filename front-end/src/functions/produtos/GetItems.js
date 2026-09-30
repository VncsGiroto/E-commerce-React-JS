import { api } from "../Api";

// Retorna sempre um array de produtos (desembrulha envelope paginado
// { data, page, limit, total, totalPages } quando o back-end pagina).
export default async function GetItems(page, limit){
    try {
        const params = page !== undefined || limit !== undefined
            ? { ...(page !== undefined && { page }), ...(limit !== undefined && { limit }) }
            : undefined;
        const response = await api.get("/produto", { params });
        const payload = response.data;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        return payload;
    } catch (error) {
        return error.response ?? null
    }
}
