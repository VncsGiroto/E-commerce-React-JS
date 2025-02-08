import { api } from "../Api"

export default async function CheckAdminToken(){
    try {
        const response = api.get("/admin/getme")
        return response;
    } catch (error) {
        return null;
    }
}