import { api } from "../Api"

export default async function DeleteItems(id){
    try {
        const response = await api.delete(`/produto/delete/${id}`);
        return response.data;     
    } catch (error) {
        return response
    }
}