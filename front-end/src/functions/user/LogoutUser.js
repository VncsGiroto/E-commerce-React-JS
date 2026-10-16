import { api } from "../Api"

export default async function LogoutUser(){
    try {
        const response = await api.get("/user/logout");
        return response
    } catch (error) {
        return error.response ?? null
    }
}