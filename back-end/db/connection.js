import mongoose from 'mongoose';
import 'dotenv/config'

export default async function connectDataBase(){
    const mongoUrl = process.env.MONGODB_URL || process.env.URL;
    if (!mongoUrl) {
        console.error("Variável de ambiente MONGODB_URL (ou URL) não definida. Configure a string de conexão do MongoDB antes de iniciar.");
        process.exit(1);
    }
    try {
        await mongoose.connect(mongoUrl);
        console.log("Banco De Dados Conectado")
        return
    } catch (error) {
        console.log(error, "\nErro ao se conectar com a db")
        process.exit(1)
    }
}