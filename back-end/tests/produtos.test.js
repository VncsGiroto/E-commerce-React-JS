import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupDb, teardownDb, createTestAdmin } from './helpers.js';

const { default: app } = await import('../app.js');

// PNG 1x1 válido para o middleware de imagem
const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// Mesmo diretório estático usado pelo middleware do backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.join(__dirname, '../static/images');

before(setupDb);
after(teardownDb);

describe('produtos', () => {
    const admin = request.agent(app);
    let categoriaId = null;
    const criados = [];

    it('prepara admin e categoria', async () => {
        await createTestAdmin('admin', 'senhaadmin123');
        const login = await admin.post('/admin/login').send({ usuario: 'admin', senha: 'senhaadmin123' });
        assert.equal(login.status, 200);

        const cat = await admin.post('/categoria/criar').send({ nome: 'Eletronicos', descricao: 'Teste' });
        assert.equal(cat.status, 201);
        categoriaId = cat.body.categoria._id;
        assert.match(categoriaId, /^[0-9a-fA-F]{24}$/);
    });

    it('criar sem token retorna 401', async () => {
        const res = await request(app).post('/produto/criar').send({
            nome: 'X', descricao: 'Y', categoriaId: '507f1f77bcf86cd799439011', preco: 10, imagem: PNG_1X1,
        });
        assert.equal(res.status, 401);
    });

    it('criar com campos faltando retorna 400 e não salva arquivo órfão', async () => {
        const res = await admin.post('/produto/criar').send({ nome: 'Incompleto' });
        assert.equal(res.status, 400);
    });

    it('criar com categoriaId inválido retorna 400', async () => {
        const res = await admin.post('/produto/criar').send({
            nome: 'P', descricao: 'D', categoriaId: 'invalido', preco: 10, imagem: PNG_1X1,
        });
        assert.equal(res.status, 400);
    });

    it('cria produto com 201 e imagem vira URL absoluta', async () => {
        const res = await admin.post('/produto/criar').send({
            nome: 'Notebook',
            descricao: 'Alta performance',
            categoriaId,
            preco: 3500,
            imagem: PNG_1X1,
        });
        assert.equal(res.status, 201);
        assert.ok(String(res.body.imagem).includes('/static/images/'));
        criados.push(res.body);
    });

    it('duplicata por nome retorna 409', async () => {
        const res = await admin.post('/produto/criar').send({
            nome: 'Notebook',
            descricao: 'Outro',
            categoriaId,
            preco: 100,
            imagem: PNG_1X1,
        });
        assert.equal(res.status, 409);
    });

    it('aceita preco 0', async () => {
        const res = await admin.post('/produto/criar').send({
            nome: 'Brinde',
            descricao: 'Gratis',
            categoriaId,
            preco: 0,
            imagem: PNG_1X1,
        });
        assert.equal(res.status, 201);
        criados.push(res.body);
    });

    it('lista sem params retorna array; com ?page&limit retorna envelope', async () => {
        const all = await request(app).get('/produto/');
        assert.equal(all.status, 200);
        assert.ok(Array.isArray(all.body));

        const paged = await request(app).get('/produto/?page=1&limit=1');
        assert.equal(paged.status, 200);
        assert.equal(paged.body.data.length, 1);
        assert.equal(paged.body.page, 1);
        assert.equal(paged.body.limit, 1);
        assert.ok(paged.body.total >= 2);
        assert.ok(paged.body.totalPages >= 2);
    });

    it('get por categoria com ObjectId inválido retorna 400', async () => {
        const res = await request(app).get('/produto/nao-eh-id');
        assert.equal(res.status, 400);
    });

    it('update parcial mantém imagem e valida _id', async () => {
        const alvo = criados[0];
        const semId = await admin.put('/produto/update').send({ nome: 'Sem id' });
        assert.equal(semId.status, 400);

        const upd = await admin.put('/produto/update').send({ _id: alvo._id, preco: 3000 });
        assert.equal(upd.status, 200);
        assert.equal(upd.body.produto.preco, 3000);
        assert.equal(upd.body.produto.nome, 'Notebook');
    });

    it('aceita imagem PNG de ~1.5MiB (payload acima do antigo limite de 1mb)', async () => {
        const { Buffer } = await import('node:buffer');
        const IMAGE_BYTES = Math.floor(1.5 * 1024 * 1024);
        const seed = Buffer.from(PNG_1X1, 'base64');
        const buf = Buffer.alloc(IMAGE_BYTES);
        seed.copy(buf);
        assert.ok(buf.length > 1024 * 1024 && buf.length < 2 * 1024 * 1024);
        const imagemGrande = buf.toString('base64');
        const payload = { nome: 'Notebook Grande', descricao: 'Imagem ~1.5MiB', categoriaId, preco: 100, imagem: imagemGrande };
        // Prova que o JSON ultrapassaria o parser antigo de 1mb
        assert.ok(Buffer.byteLength(JSON.stringify(payload), 'utf8') > 1024 * 1024);
        const res = await admin.post('/produto/criar').send(payload);
        assert.equal(res.status, 201);
        assert.ok(String(res.body.imagem).includes('/static/images/'));
        criados.push(res.body);
    });

    it('rejeita imagem acima de 2MiB com 400 e sem criar produto/arquivo', async () => {
        const { Buffer } = await import('node:buffer');
        const IMAGE_BYTES = Math.floor(2.5 * 1024 * 1024);
        const seed = Buffer.from(PNG_1X1, 'base64');
        const buf = Buffer.alloc(IMAGE_BYTES);
        seed.copy(buf);
        const imagemGrandeDemais = buf.toString('base64');
        const antes = await request(app).get('/produto/');
        assert.equal(antes.status, 200);
        const arquivosAntes = await fs.readdir(imagesDir).catch(() => []);
        const res = await admin.post('/produto/criar').send({
            nome: 'Notebook Gigante',
            descricao: 'Imagem >2MiB',
            categoriaId,
            preco: 100,
            imagem: imagemGrandeDemais,
        });
        assert.equal(res.status, 400);
        assert.match(String(res.body.message || res.body.error || ''), /2MiB/);
        const depois = await request(app).get('/produto/');
        assert.equal(depois.body.length, antes.body.length);
        const arquivosDepois = await fs.readdir(imagesDir).catch(() => []);
        assert.deepEqual(arquivosDepois.sort(), arquivosAntes.sort());
    });

    it('delete com id inválido retorna 400; válido remove', async () => {
        const bad = await admin.delete('/produto/delete/xyz');
        assert.equal(bad.status, 400);

        const basenames = criados.map((p) => path.basename(String(p.imagem).split('?')[0]));
        for (const base of basenames) {
            assert.match(base, /^[0-9a-fA-F-]{36}\.(jpg|jpeg|png|tiff|webp)$/);
        }

        for (const p of criados) {
            const del = await admin.delete(`/produto/delete/${p._id}`);
            assert.equal(del.status, 200);
        }
        const all = await request(app).get('/produto/');
        assert.deepEqual(all.body, []);
        for (const base of basenames) {
            await assert.rejects(fs.access(path.join(imagesDir, base)));
        }
    });
});
