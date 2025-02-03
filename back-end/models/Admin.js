import mongoose from "mongoose";

const { Schema } = mongoose;

const adminSchema = new Schema({
    usuario: {type: String, required: true, trim: true},
    senha: {type: String, required: true, trim: true},
    cargo: {type: String, required: true, trim: true},
})

const Admin = mongoose.model('Admin', adminSchema)

export default Admin; 