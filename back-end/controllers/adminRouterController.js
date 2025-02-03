import Admin from "../models/Admin.js"
import bcrypt, { hash } from "bcrypt"
import 'dotenv/config'
import jwt from "jsonwebtoken";

async function getAll(req, res) {
    try {
        const admins = await Admin.find();
        res.status(200)
            .json(admins);
    } catch (error) {
        res.status(404)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function create(req, res) {
    try {
        const { usuario, senha, cargo } = req.body
        const admin = await Admin.findOne({usuario: usuario});
        if(admin){
            res.status(404)
                .json({message: "Admin Já Existente"})
            return
        }

        const saltRound = Math.floor(Math.random() * (10 - 7) + 8);
        const hash = await bcrypt.hash(senha, saltRound);
        const novoAdmin = new Admin({
            usuario,
            senha: hash,
            cargo
        })
        //await novoAdmin.save()
        res.status(200)
            .json(novoAdmin);
    } catch (error) {
        res.status(404)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function getMe(req,res){
    try {
        const admin = await Admin.findById(req.id)
        if(!admin){
            res.status(404)
                .json({message: "Admin Nao Encontrado"})
            console.log(error);
            return
        }

        res.status(200)
            .json(admin);
    } catch (error) {
        res.status(404)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function login(req,res){
    try {
        const { usuario, senha } = req.body

        const admin = await Admin.findOne({usuario: usuario})

        if(!admin){
            res.status(401)
                .json({message: "Usuario Inexistente"})
            return;
        }
        
        const IsPassword = await bcrypt.compare(senha, admin.senha)
        
        if(!IsPassword){
            res.status(404)
                .json({message: "Senha Incorreta"})
        }

        const token = jwt.sign(admin.id, process.env.JWT_ADMIN_SECRET);

        res.status(200)
            .json({
                message: 'Usuário Logado',
                token
            });
    } catch (error) {
        res.status(404)
            json({message: "Erro Inesperado"})
        console.log(error);
    }
}

export default {getAll, create, login}