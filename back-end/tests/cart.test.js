import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupDb, teardownDb } from './helpers.js';

const { default: app } = await import('../app.js');

const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

before(setupDb);
after(teardownDb);

async function makeUser(email, nome) {
    const agent = request.agent(app);
    await agent.post('/user/create').send({ nome, email, senha: 'senha123' });
    await agent.post('/user/login').send({ email, senha: 'senha123' });
    const me = await agent.get('/user/me');
    assert.equal(me.status, 200);
    return { agent, userId: me.body._id };
}

describe('carrinho', () => {
    const admin = request.agent(app);
    let produtoId = null;

    after(async () => {
        if (produtoId) await admin.delete(`/produto/delete/${produtoId}`);
    });

    it('prepara produto', async () => {
        await admin.post('/admin/criar').send({ usuario: 'admin', senha: 'senhaadmin123' });
        await admin.post('/admin/login').send({ usuario: 'admin', senha: 'senhaadmin123' });
        const cat = await admin.post('/categoria/criar').send({ nome: 'Geral' });
        const prod = await admin.post('/produto/criar').send({
            nome: 'Mouse', descricao: 'Sem fio', categoriaId: cat.body.categoria._id, preco: 150, imagem: PNG_1X1,
        });
        assert.equal(prod.status, 201);
        produtoId = prod.body._id;
    });

    it('cria carrinho e calcula total no servidor (fonte da verdade)', async () => {
        const { agent, userId } = await makeUser('a@example.com', 'A');
        const res = await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 2 }] });
        assert.equal(res.status, 201);
        assert.equal(res.body.valorTotal, 300);
        assert.equal(res.body.items[0].subtotal, 300);

        const got = await agent.get(`/cart/${userId}`);
        assert.equal(got.status, 200);
        assert.equal(got.body.valorTotal, 300);
    });

    it('usuário B não acessa carrinho do usuário A (403 IDOR)', async () => {
        const { userId: idA } = await makeUser('b@example.com', 'B');
        const { agent: agentC } = await makeUser('c@example.com', 'C');
        const res = await agentC.get(`/cart/${idA}`);
        assert.equal(res.status, 403);
    });

    it('atualiza quantidade e remove item', async () => {
        const { agent, userId } = await makeUser('e@example.com', 'E');
        const created = await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });
        const cartId = created.body.cartId;

        const upd = await agent.put(`/cart/atualizar/${cartId}`).send({ items: [{ produtoId, quantidade: 3 }] });
        assert.equal(upd.status, 200);
        assert.equal(upd.body.valorTotal, 450);

        const rm = await agent.delete(`/cart/${cartId}/item/${produtoId}`);
        assert.equal(rm.status, 200);
        assert.equal(rm.body.valorTotal, 0);

        const me = await agent.get(`/cart/${userId}`);
        assert.equal(me.body.items.length, 0);
    });

    it('produto inexistente retorna 404 e quantidade inválida retorna 400', async () => {
        const { agent } = await makeUser('f@example.com', 'F');
        const missing = await agent.post('/cart/criar').send({
            items: [{ produtoId: '507f1f77bcf86cd799439011', quantidade: 1 }],
        });
        assert.equal(missing.status, 404);

        const badQty = await agent.post('/cart/criar').send({
            items: [{ produtoId, quantidade: 0 }],
        });
        assert.equal(badQty.status, 400);
    });
});
