import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

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
