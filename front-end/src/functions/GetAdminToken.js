import { api } from "./Api"

export default async function GetAdminToken(usuario, senha){
    try {
        const response = await api.post("/admin/login", {
            usuario,
            senha
        });
        return response
    } catch (error) {
        return null
    }
}