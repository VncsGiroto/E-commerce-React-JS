import { api } from "../Api"

export default async function CheckUserToken(){
    try {
        const response = await api.get("/user/me")
        return response;
    } catch (error) {
        return null;
    }
}