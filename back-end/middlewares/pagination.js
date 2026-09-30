const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Extrai { page, limit, skip } de req.query.
// Retorna null quando paginação não foi solicitada (resposta legada em array).
export function getPagination(query) {
    const hasPage = query.page !== undefined;
    const hasLimit = query.limit !== undefined;
    if (!hasPage && !hasLimit) return null;

    let page = parseInt(query.page ?? '1', 10);
    let limit = parseInt(query.limit ?? String(DEFAULT_LIMIT), 10);
    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    return { page, limit, skip: (page - 1) * limit };
}

export function paginatedResponse({ data, total, page, limit }) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { data, page, limit, total, totalPages };
}
