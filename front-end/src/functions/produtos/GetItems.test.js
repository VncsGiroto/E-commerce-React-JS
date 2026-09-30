import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../Api.js', () => ({
    api: { get: vi.fn() },
}));

import { api } from '../Api.js';
import GetItems from './GetItems.js';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('GetItems', () => {
    it('retorna array legado como está', async () => {
        api.get.mockResolvedValue({ data: [{ _id: '1' }] });
        await expect(GetItems()).resolves.toEqual([{ _id: '1' }]);
        expect(api.get).toHaveBeenCalledWith('/produto', { params: undefined });
    });

    it('desembrulha envelope paginado { data, ... }', async () => {
        api.get.mockResolvedValue({ data: { data: [{ _id: '1' }], page: 1, total: 1 } });
        await expect(GetItems(1, 10)).resolves.toEqual([{ _id: '1' }]);
        expect(api.get).toHaveBeenCalledWith('/produto', { params: { page: 1, limit: 10 } });
    });

    it('retorna error.response na falha e null sem resposta', async () => {
        api.get.mockRejectedValueOnce({ response: { status: 500 } });
        await expect(GetItems()).resolves.toEqual({ status: 500 });

        api.get.mockRejectedValueOnce(new Error('rede'));
        await expect(GetItems()).resolves.toBeNull();
    });
});
