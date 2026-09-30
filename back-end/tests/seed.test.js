import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import Admin from '../models/Admin.js';
import seedAdmin from '../db/seedAdmin.js';
import { setupDb, teardownDb } from './helpers.js';

before(setupDb);
after(teardownDb);

describe('seed do admin inicial', () => {
    it('cria o admin quando não existe', async () => {
        process.env.BOOTSTRAP_ADMIN_USER = 'seed';
        process.env.BOOTSTRAP_ADMIN_SENHA = 'seed123';

        const res = await seedAdmin();
        assert.equal(res.seeded, true);

        const admin = await Admin.findOne({ usuario: 'seed' });
        assert.ok(admin);
        assert.notEqual(admin.senha, 'seed123');
    });

    it('é idempotente: segunda execução não duplica', async () => {
        const res = await seedAdmin();
        assert.equal(res.seeded, false);
        assert.equal(await Admin.countDocuments({ usuario: 'seed' }), 1);
    });

    it('não faz nada sem as variáveis de ambiente', async () => {
        delete process.env.BOOTSTRAP_ADMIN_USER;
        delete process.env.BOOTSTRAP_ADMIN_SENHA;

        const res = await seedAdmin();
        assert.equal(res.seeded, false);
        assert.equal(await Admin.countDocuments(), 1);
    });
});
