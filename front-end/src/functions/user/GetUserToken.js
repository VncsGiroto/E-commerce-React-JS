import { api } from "../Api"

export default async function GetUserToken(email, senha){
    try {
        const response = await api.post("/user/login", {
            email,
            senha
        });
        return response
    } catch (error) {
        return null
    }
}