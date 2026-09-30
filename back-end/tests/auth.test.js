import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupDb, teardownDb } from './helpers.js';

const { default: app } = await import('../app.js');

before(setupDb);
after(teardownDb);

describe('auth: user', () => {
    const agent = request.agent(app);

    it('registra usuário com 201 e sem vazar senha', async () => {
        const res = await agent.post('/user/create').send({
            nome: 'Teste',
            email: 'teste@example.com',
            senha: 'senha123',
        });
        assert.equal(res.status, 201);
        assert.equal(res.body.email, 'teste@example.com');
        assert.ok(!('senha' in res.body));
    });

    it('rejeita duplicata com 409', async () => {
        const res = await agent.post('/user/create').send({
            nome: 'Teste',
            email: 'teste@example.com',
            senha: 'senha123',
        });
        assert.equal(res.status, 409);
    });

    it('rejeita payload inválido com 400', async () => {
        const res = await agent.post('/user/create').send({
            nome: 'X',
            email: 'nao-email',
            senha: '123',
        });
        assert.equal(res.status, 400);
    });

    it('login com senha errada retorna 401 genérico', async () => {
        const res = await agent.post('/user/login').send({
            email: 'teste@example.com',
            senha: 'errada123',
        });
        assert.equal(res.status, 401);
        assert.equal(res.body.message, 'Credenciais inválidas');
    });

    it('login com usuário inexistente não enumera (401 genérico)', async () => {
        const res = await agent.post('/user/login').send({
            email: 'ninguem@example.com',
            senha: 'senha123',
        });
        assert.equal(res.status, 401);
        assert.equal(res.body.message, 'Credenciais inválidas');
    });

    it('login válido autentica e /user/me retorna _id, nome e email', async () => {
        const login = await agent.post('/user/login').send({
            email: 'teste@example.com',
            senha: 'senha123',
        });
        assert.equal(login.status, 200);
        assert.ok((login.headers['set-cookie'] ?? []).some((c) => c.startsWith('Usertoken=')));

        const me = await agent.get('/user/me');
        assert.equal(me.status, 200);
        assert.equal(me.body.email, 'teste@example.com');
        assert.equal(me.body.nome, 'Teste');
        assert.match(me.body._id, /^[0-9a-fA-F]{24}$/);
    });

    it('rota protegida sem token retorna 401', async () => {
        const res = await request(app).get('/user/me');
        assert.equal(res.status, 401);
    });

    it('logout funciona mesmo sem token e limpa o cookie', async () => {
        const res = await request(app).get('/user/logout');
        assert.equal(res.status, 200);
        assert.ok((res.headers['set-cookie'] ?? []).some((c) => c.startsWith('Usertoken=Expired') || c.includes('Expires=Thu, 01 Jan 1970')));
    });
});

describe('auth: admin bootstrap', () => {
    const admin = request.agent(app);

    it('cria o primeiro admin sem token (bootstrap)', async () => {
        const res = await admin.post('/admin/criar').send({
            usuario: 'admin',
            senha: 'senhaadmin123',
        });
        assert.equal(res.status, 201);
        assert.ok(!('senha' in res.body));
    });

    it('login admin autentica e lista usuários', async () => {
        const login = await admin.post('/admin/login').send({
            usuario: 'admin',
            senha: 'senhaadmin123',
        });
        assert.equal(login.status, 200);

        const users = await admin.get('/user/');
        assert.equal(users.status, 200);
        assert.ok(Array.isArray(users.body));
    });

    it('usuário comum não lista usuários (401 sem cookie admin)', async () => {
        const user = request.agent(app);
        await user.post('/user/create').send({ nome: 'Comum', email: 'comum@example.com', senha: 'senha123' });
        await user.post('/user/login').send({ email: 'comum@example.com', senha: 'senha123' });
        const res = await user.get('/user/');
        assert.equal(res.status, 401);
    });
});
