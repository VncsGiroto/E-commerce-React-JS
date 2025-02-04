import mongoose from 'mongoose';
import 'dotenv/config'

export default async function connectDataBase(){
    try {
        await mongoose.connect(process.env.URL);
        console.log("Banco De Dados Conectado")
        return
    } catch (error) {
        console.log(error)
        return
    }
}