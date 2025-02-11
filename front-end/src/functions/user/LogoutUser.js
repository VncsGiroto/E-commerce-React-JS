import { api } from "../Api"

export default async function LogoutUser(){
    try {
        const response = await api.post("/user/logout");
        return response
    } catch (error) {
        return null
    }
}