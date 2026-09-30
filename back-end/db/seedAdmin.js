import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";

// Cria o admin inicial a partir de variáveis de ambiente, de forma idempotente.
// Só age quando BOOTSTRAP_ADMIN_USER e BOOTSTRAP_ADMIN_SENHA estão definidos.
export default async function seedAdmin() {
    const usuario = process.env.BOOTSTRAP_ADMIN_USER;
    const senha = process.env.BOOTSTRAP_ADMIN_SENHA;

    if (!usuario || !senha) {
        return { seeded: false, reason: "variáveis BOOTSTRAP_ADMIN_* ausentes" };
    }
    if (senha.length < 6) {
        console.log("Seed de admin ignorado: BOOTSTRAP_ADMIN_SENHA deve ter no mínimo 6 caracteres");
        return { seeded: false, reason: "senha curta" };
    }

    const existing = await Admin.findOne({ usuario });
    if (existing) {
        console.log(`Seed de admin ignorado: '${usuario}' já existe`);
        return { seeded: false, reason: "já existe" };
    }

    const hash = await bcrypt.hash(senha, 12);
    await new Admin({ usuario, senha: hash }).save();
    console.log(`Admin inicial '${usuario}' criado via seed`);
    return { seeded: true };
}
