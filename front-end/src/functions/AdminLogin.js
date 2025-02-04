import { api } from "./Api"

export default async function AdminLogin(usuario, senha){
    try {
        const response = await api.post("/admin/login", {
            usuario,
            senha
        });
        console.log(response)
        return response.data
    } catch (error) {
        console.log(error);
    }
}