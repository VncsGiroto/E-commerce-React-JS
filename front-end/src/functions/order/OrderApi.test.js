import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../Api.js', () => ({
    api: { get: vi.fn(), post: vi.fn() },
}));

import { api } from '../Api.js';
import { CheckoutOrder, GetOrders, GetOrder } from './OrderApi.js';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('CheckoutOrder', () => {
    it('envia X-Idempotency-Key e retorna response.data no sucesso', async () => {
        api.post.mockResolvedValue({ data: { _id: 'o1', status: 'pago_simulado', total: 30 } });

        await expect(CheckoutOrder('chave-123')).resolves.toEqual({ _id: 'o1', status: 'pago_simulado', total: 30 });
        expect(api.post).toHaveBeenCalledWith('/order/checkout', {}, {
            headers: { 'X-Idempotency-Key': 'chave-123' },
        });
    });

    it('retorna error.response na falha', async () => {
        api.post.mockRejectedValue({ response: { status: 400, data: { message: 'Carrinho vazio' } } });
        await expect(CheckoutOrder('k')).resolves.toEqual({ status: 400, data: { message: 'Carrinho vazio' } });
    });
});

describe('GetOrders', () => {
    it('normaliza contrato legado { total, pedidos }', async () => {
        api.get.mockResolvedValue({ data: { total: 1, pedidos: [{ _id: 'o1' }] } });
        await expect(GetOrders()).resolves.toEqual({ total: 1, pedidos: [{ _id: 'o1' }] });
        expect(api.get).toHaveBeenCalledWith('/order/');
    });

    it('normaliza contrato paginado { data, total }', async () => {
        api.get.mockResolvedValue({ data: { data: [{ _id: 'o2' }], total: 1, page: 1 } });
        await expect(GetOrders()).resolves.toEqual({ total: 1, pedidos: [{ _id: 'o2' }] });
    });

    it('retorna error.response na falha', async () => {
        api.get.mockRejectedValue({ response: { status: 401, data: { message: 'auth' } } });
        await expect(GetOrders()).resolves.toEqual({ status: 401, data: { message: 'auth' } });
    });
});

describe('GetOrder', () => {
    it('retorna response.data no sucesso', async () => {
        api.get.mockResolvedValue({ data: { _id: 'o1', status: 'pago_simulado' } });
        await expect(GetOrder('o1')).resolves.toEqual({ _id: 'o1', status: 'pago_simulado' });
        expect(api.get).toHaveBeenCalledWith('/order/o1');
    });

    it('retorna error.response na falha', async () => {
        api.get.mockRejectedValue({ response: { status: 404, data: { message: 'Pedido não encontrado' } } });
        await expect(GetOrder('x')).resolves.toEqual({ status: 404, data: { message: 'Pedido não encontrado' } });
    });
});
