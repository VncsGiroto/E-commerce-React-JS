import mongoose from "mongoose";

const { Schema } = mongoose;

const produtoSchema = new Schema({
    nome: {type: String, required: true, trim: true},
    imagem: {type: String, required: true, trim: true},
    descricao: {type: String, required: true, trim: true},
    categoria: {type: String, required: true, trim: true},
    preco: {type: Number, required: true},
})

const Produto = mongoose.model('Produto', produtoSchema)

export default Produto; 