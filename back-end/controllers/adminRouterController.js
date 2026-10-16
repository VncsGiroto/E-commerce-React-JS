import Admin from "../models/Admin.js"
import bcrypt from "bcrypt"
import 'dotenv/config'
import jwt from "jsonwebtoken";

async function getMe(req,res){
    try {
        const admin = await Admin.findById(req.id).select('-senha')
        if(!admin){
            res.status(404)
                .json({message: "Admin Nao Encontrado"})
            return
        }

        res.status(200)
            .json({ usuario: admin.usuario });
    } catch (error) {
        res.status(500)
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
                .json({message: "Credenciais inválidas"})
            return;
        }

        const IsPassword = await bcrypt.compare(senha, admin.senha)

        if(!IsPassword){
            res.status(401)
                .json({message: "Credenciais inválidas"})
            return
        }

        const token = jwt.sign({ id: admin.id }, process.env.JWT_ADMIN_SECRET, { expiresIn: '1h' });

        res.status(200)
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Ativa secure apenas em produção (HTTPS)
                sameSite: 'Strict', // Proteção CSRF
                maxAge: 3600000 // 1 hora
            })
            .json({
                message: 'Usuário Logado',
            });
        return
    } catch (error) {
        res.status(500)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function logout(req, res) {
    try {
        res.status(200).clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/',
        }).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
        res.status(500)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}


export default {login, getMe, logout}
