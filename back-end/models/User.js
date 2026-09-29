import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    nome: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 255 },
    senha: { type: String, required: true, maxlength: 255 }
});

const User = mongoose.model('User', userSchema);

export default User;