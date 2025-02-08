import { api } from "../Api"

export default async function LogoutAdmin(){
    try {
        const response = await api.post("/admin/logout");
        return response
    } catch (error) {
        return null
    }
}