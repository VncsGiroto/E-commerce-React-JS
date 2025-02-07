import { api } from "./Api"

export default async function GetItems(){
    try {
        const response = await api.get();
        return response.data;     
    } catch (error) {
        return response
    }
}