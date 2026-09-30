import { api } from "../Api"

export default async function CheckAdminToken(){
    try {
        const response = await api.get("/admin/getme")
        return response;
    } catch {
        return null;
    }
}