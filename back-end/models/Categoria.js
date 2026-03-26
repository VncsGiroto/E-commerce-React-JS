import mongoose from "mongoose";

const { Schema } = mongoose;

const categoriaSchema = new Schema({
    nome: { type: String, required: true, trim: true, unique: true },
    descricao: { type: String, trim: true },
});

const Categoria = mongoose.model('Categoria', categoriaSchema);

export default Categoria;
