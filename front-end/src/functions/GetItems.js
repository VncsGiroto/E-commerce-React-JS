import { api } from "./Api"

export default async function GetItems(){
    try {
        const response = await api.get();
        console.log(response)
        return response.data
    } catch (error) {
        console.log(error);
    }
}