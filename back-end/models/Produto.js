import mongoose from "mongoose";

const { Schema } = mongoose;

const produtoSchema = new Schema({
    nome: {type: String, required: true, trim: true},
    imagem: {type: String, required: true, trim: true},
    descricao: {type: String, required: true, trim: true},
    categoriaId: {type: Schema.Types.ObjectId, ref: 'Categoria', required: true},
    preco: {type: Number, required: true},
}, { timestamps: true })

const Produto = mongoose.model('Produto', produtoSchema)

export default Produto; 