import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../Api.js', () => ({
    api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import { api } from '../Api.js';
import { GetCart, CreateCart, UpdateCart, AddToCart } from './CartApi.js';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('GetCart', () => {
    it('retorna response.data no sucesso', async () => {
        api.get.mockResolvedValue({ data: { cartId: 'c1', items: [] } });
        await expect(GetCart('u1')).resolves.toEqual({ cartId: 'c1', items: [] });
        expect(api.get).toHaveBeenCalledWith('/cart/u1');
    });

    it('retorna error.response na falha', async () => {
        api.get.mockRejectedValue({ response: { status: 404, data: { message: 'x' } } });
        await expect(GetCart('u1')).resolves.toEqual({ status: 404, data: { message: 'x' } });
    });
});

describe('AddToCart', () => {
    it('cria carrinho quando não existe (404)', async () => {
        api.get.mockRejectedValue({ response: { status: 404 } });
        api.post.mockResolvedValue({ data: { cartId: 'novo', valorTotal: 10 } });

        const res = await AddToCart('u1', 'p1', 2);

        expect(api.post).toHaveBeenCalledWith('/cart/criar', { items: [{ produtoId: 'p1', quantidade: 2 }] });
        expect(res).toEqual({ cartId: 'novo', valorTotal: 10 });
    });

    it('mescla quantidades no carrinho existente', async () => {
        api.get.mockResolvedValue({
            data: {
                cartId: 'c1',
                items: [
                    { produtoId: 'p1', quantidade: 1 },
                    { produtoId: { _id: 'p2' }, quantidade: 2 },
                ],
            },
        });
        api.put.mockResolvedValue({ data: { cartId: 'c1', valorTotal: 99 } });

        await AddToCart('u1', 'p1', 3);

        expect(api.put).toHaveBeenCalledWith('/cart/atualizar/c1', {
            items: [
                { produtoId: 'p1', quantidade: 4 },
                { produtoId: 'p2', quantidade: 2 },
            ],
        });
    });

    it('CreateCart envia items e UpdateCart usa a rota correta', async () => {
        api.post.mockResolvedValue({ data: { cartId: 'c9' } });
        await CreateCart([{ produtoId: 'p', quantidade: 1 }]);
        expect(api.post).toHaveBeenCalledWith('/cart/criar', { items: [{ produtoId: 'p', quantidade: 1 }] });

        api.put.mockResolvedValue({ data: { cartId: 'c9' } });
        await UpdateCart('c9', [{ produtoId: 'p', quantidade: 5 }]);
        expect(api.put).toHaveBeenCalledWith('/cart/atualizar/c9', { items: [{ produtoId: 'p', quantidade: 5 }] });
    });
});
