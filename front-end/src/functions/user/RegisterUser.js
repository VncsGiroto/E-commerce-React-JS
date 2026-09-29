import { api } from "../Api"

export default async function RegisterUser(nome, email, senha){
    try {
        const response = await api.post("/user/create", {
            nome,
            email,
            senha
        });
        return response
    } catch (error) {
        return error.response ?? null
    }
}
