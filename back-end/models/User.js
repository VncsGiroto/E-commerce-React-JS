import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    senha: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

export default User;