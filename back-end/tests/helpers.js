import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Admin from '../models/Admin.js';

if (!process.env.JWT_ADMIN_SECRET) process.env.JWT_ADMIN_SECRET = 'test-admin-secret';
if (!process.env.JWT_USER_SECRET) process.env.JWT_USER_SECRET = 'test-user-secret';
process.env.NODE_ENV = 'test';

let mongod = null;

export async function setupDb() {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
}

export async function teardownDb() {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
}

// Cria um admin diretamente pelo modelo (substitui o antigo POST /admin/criar,
// removido por segurança; o bootstrap em produção é via seedAdmin).
// Idempotente: reutiliza o registro existente se a senha conferir;
// caso contrário falha com mensagem clara em vez de erro duplicado do banco.
export async function createTestAdmin(usuario = 'admin', senha = 'senhaadmin123') {
    const existing = await Admin.findOne({ usuario });
    if (existing) {
        const ok = await bcrypt.compare(senha, existing.senha);
        if (ok) return existing;
        throw new Error(`Admin '${usuario}' já existe com credencial diferente`);
    }
    const hash = await bcrypt.hash(senha, 12);
    return Admin.create({ usuario, senha: hash });
}
