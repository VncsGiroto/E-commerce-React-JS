import mongoose from "mongoose";

const { Schema } = mongoose;

const adminSchema = new Schema({
    usuario: {type: String, required: true, trim: true, unique: true},
    senha: {type: String, required: true},
})

const Admin = mongoose.model('Admin', adminSchema)

export default Admin; 