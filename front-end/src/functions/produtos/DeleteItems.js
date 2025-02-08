import { api } from "../Api"

export default async function DeleteItems(id){
    try {
        const response = await api.delete(`/delete/${id}`);
        return response.data;     
    } catch (error) {
        return response
    }
}