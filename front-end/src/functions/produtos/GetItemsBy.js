import { api } from "../Api";

export default async function GetItemsBy(categoria){
    try {
        const response = await api.get(`/${categoria}`);
        return response.data;     
    } catch (error) {
        return response
    }
}