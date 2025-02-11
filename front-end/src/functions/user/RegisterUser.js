import { api } from "../Api"

export default async function GetUseroken(nome, email, senha){
    try {
        const response = await api.post("/user/create", {
            nome,
            email,
            senha
        });
        return response
    } catch (error) {
        return null
    }
}