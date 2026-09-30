import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

// Fixa as origens antes de importar o app (dotenv não sobrescreve vars já definidas)
process.env.CORS_ORIGIN = 'http://localhost:5173,http://127.0.0.1:5173';
import { setupDb, teardownDb } from './helpers.js';

const { default: app } = await import('../app.js');

before(setupDb);
after(teardownDb);

describe('cors', () => {
    for (const origin of ['http://localhost:5173', 'http://127.0.0.1:5173']) {
        it(`preflight OPTIONS liberado para ${origin}`, async () => {
            const res = await request(app)
                .options('/user/create')
                .set('Origin', origin)
                .set('Access-Control-Request-Method', 'POST')
                .set('Access-Control-Request-Headers', 'content-type');
            assert.equal(res.status, 204);
            assert.equal(res.headers['access-control-allow-origin'], origin);
        });
    }

    it('origem desconhecida não recebe ACAO', async () => {
        const res = await request(app)
            .options('/user/create')
            .set('Origin', 'http://malicioso.com')
            .set('Access-Control-Request-Method', 'POST');
        assert.ok(!res.headers['access-control-allow-origin']);
    });
});
