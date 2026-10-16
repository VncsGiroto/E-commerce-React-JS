import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupDb, teardownDb, createTestAdmin } from './helpers.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

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

describe('pedidos simulados', () => {
    const admin = request.agent(app);
    let produtoId = null;
    let categoriaId = null;

    it('prepara produto', async () => {
        await createTestAdmin('admin', 'senhaadmin123');
        await admin.post('/admin/login').send({ usuario: 'admin', senha: 'senhaadmin123' });
        const cat = await admin.post('/categoria/criar').send({ nome: 'Pedidos' });
        categoriaId = cat.body.categoria._id;
        const prod = await admin.post('/produto/criar').send({
            nome: 'Teclado', descricao: 'Mecânico', categoriaId, preco: 200, imagem: PNG_1X1,
        });
        assert.equal(prod.status, 201);
        produtoId = prod.body._id;
    });

    it('cria pedido recalculando preço atual e limpa carrinho', async () => {
        const { agent, userId } = await makeUser('order-a@example.com', 'OA');
        const created = await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 2 }] });
        assert.equal(created.status, 201);

        const upd = await admin.put('/produto/update').send({ _id: produtoId, preco: 250 });
        assert.equal(upd.status, 200);

        const checkout = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-a1').send({ total: 1 });
        assert.equal(checkout.status, 201);
        assert.equal(checkout.body.total, 500);
        assert.equal(checkout.body.items[0].preco, 250);
        assert.equal(checkout.body.items[0].subtotal, 500);
        assert.equal(checkout.body.status, 'pago_simulado');

        const gone = await agent.get(`/cart/${userId}`);
        assert.equal(gone.status, 404);

        await admin.put('/produto/update').send({ _id: produtoId, preco: 200 });
    });

    it('carrinho vazio retorna 400 e sem chave retorna 400', async () => {
        const { agent } = await makeUser('order-b@example.com', 'OB');
        const empty = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-b1');
        assert.equal(empty.status, 400);

        await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });
        const noKey = await agent.post('/order/checkout');
        assert.equal(noKey.status, 400);
    });

    it('repetir idempotency key retorna mesmo pedido (inclui corrida)', async () => {
        const { agent, userId } = await makeUser('order-c@example.com', 'OC');
        await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });

        const first = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-c1');
        assert.equal(first.status, 201);

        // Retry sequencial da mesma chave retorna o mesmo pedido (replay 200).
        const retry = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-c1');
        assert.equal(retry.status, 200);
        assert.equal(retry.body._id, first.body._id);
        assert.equal(retry.body.cartId, first.body.cartId);

        const [r1, r2] = await Promise.all([
            agent.post('/order/checkout').set('X-Idempotency-Key', 'key-c1'),
            agent.post('/order/checkout').set('X-Idempotency-Key', 'key-c1'),
        ]);
        assert.equal(r1.status, 200);
        assert.equal(r2.status, 200);
        assert.equal(r1.body._id, first.body._id);
        assert.equal(r2.body._id, first.body._id);

        // Sem carrinho novo, o original segue limpo após os replays.
        const gone = await agent.get(`/cart/${userId}`);
        assert.equal(gone.status, 404);

        const listed = await agent.get('/order/');
        assert.equal(listed.body.total, 1);
    });

    it('corrida idêntica (E11000 com cartId) retorna replay 200, não 409', async () => {
        const { agent, userId } = await makeUser('order-c2@example.com', 'OC2');
        await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });

        const first = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-c2');
        assert.equal(first.status, 201);

        // Carrinho novo para atravessar a checagem de carrinho e alcançar o create.
        const recreated = await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });
        assert.equal(recreated.status, 201);

        // Simula corrida idêntica: a checagem inicial não viu o pedido, mas o
        // create colide nas duas uniques (mesma chave + mesmo cartId).
        const originalFindOne = Order.findOne;
        const originalCreate = Order.create;
        let findCalls = 0;
        Order.findOne = function (filter, ...rest) {
            findCalls += 1;
            if (findCalls === 1) return Promise.resolve(null);
            return originalFindOne.call(Order, filter, ...rest);
        };
        Order.create = () => Promise.reject(Object.assign(new Error('E11000 duplicate key'), {
            code: 11000,
            keyPattern: { cartId: 1 },
            keyValue: { cartId: first.body.cartId },
        }));
        try {
            const raced = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-c2');
            assert.equal(raced.status, 200);
            assert.equal(raced.body._id, first.body._id);
        } finally {
            Order.findOne = originalFindOne;
            Order.create = originalCreate;
        }

        // Carrinho novo não pode ser apagado pelo replay da corrida.
        const stillThere = await agent.get(`/cart/${userId}`);
        assert.equal(stillThere.status, 200);
    });

    it('conflito de cartId com chave diferente retorna 409 e preserva carrinho', async () => {
        const { agent, userId } = await makeUser('order-c4@example.com', 'OC4');
        const created = await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });
        assert.equal(created.status, 201);
        const cartId = created.body.cartId;

        // Simula corrida com chave diferente: o create colide na unique de
        // cartId (mensagem com nome do índice, sem keyPattern/keyValue) e a
        // busca pela chave nova não encontra pedido (null) → 409.
        const originalFindOne = Order.findOne;
        const originalCreate = Order.create;
        Order.findOne = () => Promise.resolve(null);
        Order.create = () => Promise.reject(Object.assign(
            new Error(`E11000 duplicate key error collection: test.orders index: cartId_1 dup key: { cartId: "${cartId}" }`),
            { code: 11000 },
        ));
        try {
            const conflict = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-c4-nova');
            assert.equal(conflict.status, 409);
            assert.match(conflict.body.message, /utilizado/);
        } finally {
            Order.findOne = originalFindOne;
            Order.create = originalCreate;
        }

        // Carrinho não pode ser apagado no 409.
        const stillThere = await agent.get(`/cart/${userId}`);
        assert.equal(stillThere.status, 200);
        assert.equal(String(stillThere.body.cartId), String(cartId));
    });

    it('chave maior que 128 caracteres retorna 400', async () => {
        const { agent } = await makeUser('order-c3@example.com', 'OC3');
        await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });
        const longKey = `${'k'.repeat(129)}`;
        const res = await agent.post('/order/checkout').set('X-Idempotency-Key', longKey);
        assert.equal(res.status, 400);
    });

    it('lista só do dono, get valida ObjectId e bloqueia IDOR', async () => {
        const { agent } = await makeUser('order-d@example.com', 'OD');
        await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });
        const checkout = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-d1');
        assert.equal(checkout.status, 201);
        const orderId = checkout.body._id;

        const badId = await agent.get('/order/123');
        assert.equal(badId.status, 400);

        const { agent: other } = await makeUser('order-e@example.com', 'OE');
        const idor = await other.get(`/order/${orderId}`);
        assert.equal(idor.status, 404);

        const otherList = await other.get('/order/');
        assert.equal(otherList.status, 200);
        assert.equal(otherList.body.total, 0);

        const noAuth = await request(app).get('/order/');
        assert.equal(noAuth.status, 401);
    });

    it('mescla itens duplicados do carrinho sem falso 404', async () => {
        const { agent } = await makeUser('order-f@example.com', 'OF');
        const created = await agent.post('/cart/criar').send({
            items: [
                { produtoId, quantidade: 1 },
                { produtoId, quantidade: 2 },
            ],
        });
        assert.equal(created.status, 201);

        const checkout = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-f1');
        assert.equal(checkout.status, 201);
        assert.equal(checkout.body.items.length, 1);
        assert.equal(checkout.body.items[0].quantidade, 3);
        assert.equal(checkout.body.items[0].subtotal, 200 * 3);
        assert.equal(checkout.body.total, 600);
        assert.ok(checkout.body.cartId);
    });

    it('soma de duplicados acima de 999 retorna 400', async () => {
        const { agent } = await makeUser('order-g@example.com', 'OG');
        const created = await agent.post('/cart/criar').send({
            items: [
                { produtoId, quantidade: 600 },
                { produtoId, quantidade: 500 },
            ],
        });
        assert.equal(created.status, 201);

        const checkout = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-g1');
        assert.equal(checkout.status, 400);
    });

    it('replay da mesma chave não apaga carrinho novo, mas limpa o original pendente', async () => {
        const { agent, userId } = await makeUser('order-h@example.com', 'OH');
        await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });

        const first = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-h1');
        assert.equal(first.status, 201);
        const orderId = first.body._id;
        const originalCartId = first.body.cartId;

        // Checkout limpa o carrinho original.
        const goneAfterCreate = await agent.get(`/cart/${userId}`);
        assert.equal(goneAfterCreate.status, 404);

        // Simula limpeza pendente: recria o documento do carrinho original e
        // prova que o replay da mesma chave o remove (200 com mesmo pedido).
        await Cart.create({
            _id: originalCartId,
            userId,
            items: [{ produtoId, nome: 'Teclado', quantidade: 1, precoNaCompra: 200, subtotal: 200 }],
            valorTotal: 200,
        });
        const pending = await agent.get(`/cart/${userId}`);
        assert.equal(pending.status, 200);

        const pendingReplay = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-h1');
        assert.equal(pendingReplay.status, 200);
        assert.equal(pendingReplay.body._id, orderId);
        assert.equal(pendingReplay.body.cartId, originalCartId);

        const cleaned = await agent.get(`/cart/${userId}`);
        assert.equal(cleaned.status, 404);

        // Novo carrinho criado após o pedido deve ser preservado no replay.
        const recreated = await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });
        assert.equal(recreated.status, 201);
        assert.notEqual(recreated.body.cartId, originalCartId);

        const replay = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-h1');
        assert.equal(replay.status, 200);
        assert.equal(replay.body._id, orderId);
        assert.equal(replay.body.cartId, originalCartId);

        // Carrinho novo deve continuar existindo
        const stillThere = await agent.get(`/cart/${userId}`);
        assert.equal(stillThere.status, 200);
        assert.equal(stillThere.body.items.length, 1);
        assert.equal(String(stillThere.body.cartId), String(recreated.body.cartId));
    });

    it('não revela existência de pedido de outro usuário (404)', async () => {
        const { agent } = await makeUser('order-i@example.com', 'OI');
        await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });
        const checkout = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-i1');
        assert.equal(checkout.status, 201);

        const { agent: other } = await makeUser('order-j@example.com', 'OJ');
        const res = await other.get(`/order/${checkout.body._id}`);
        assert.equal(res.status, 404);
        assert.equal(res.body.message, 'Pedido não encontrado');
    });

    it('mesmo carrinho não gera segundo pedido com chave diferente', async () => {
        const { agent } = await makeUser('order-k@example.com', 'OK');
        await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });

        const first = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-k1');
        assert.equal(first.status, 201);

        // Carrinho já foi consumido: segunda chave não cria novo pedido
        const second = await agent.post('/order/checkout').set('X-Idempotency-Key', 'key-k2');
        assert.ok([400, 409].includes(second.status));

        const listed = await agent.get('/order/');
        assert.equal(listed.body.total, 1);
    });

    it('listagem com ?page&limit retorna paginação', async () => {
        const { agent } = await makeUser('order-l@example.com', 'OL');
        for (let i = 0; i < 3; i++) {
            await agent.post('/cart/criar').send({ items: [{ produtoId, quantidade: 1 }] });
            const checkout = await agent.post('/order/checkout').set('X-Idempotency-Key', `key-l${i}`);
            assert.equal(checkout.status, 201);
        }

        const legacy = await agent.get('/order/');
        assert.equal(legacy.status, 200);
        assert.equal(legacy.body.total, 3);
        assert.equal(legacy.body.pedidos.length, 3);

        const paged = await agent.get('/order/?page=1&limit=2');
        assert.equal(paged.status, 200);
        assert.equal(paged.body.page, 1);
        assert.equal(paged.body.limit, 2);
        assert.equal(paged.body.total, 3);
        assert.equal(paged.body.totalPages, 2);
        assert.equal(paged.body.pedidos.length, 2);
        assert.equal(paged.body.data.length, 2);

        const paged2 = await agent.get('/order/?page=2&limit=2');
        assert.equal(paged2.body.pedidos.length, 1);
    });
});
