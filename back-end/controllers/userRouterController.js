import User from "../models/User.js";
import bcrypt, { hash } from "bcrypt"
import 'dotenv/config'
import jwt from "jsonwebtoken";
import { get } from "mongoose";

async function getAll(req, res){
    try {

        const users = await User.find();
        res.status(200)
            .json(users);
    } catch (error) {
        res.status(404)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function create(req, res) {
    try {
        const { nome, email, senha } = req.body;
        const user = await User.findOne({ email: email });
        if (user) {
            res.status(404).json({ message: "Usuário Já Existente" });
            return;
        }

        const saltRound = Math.floor(Math.random() * (10 - 7) + 8);
        const hash = await bcrypt.hash(senha, saltRound);
        const novoUser = new User({
            nome,
            email,
            senha: hash
        });
        await novoUser.save();
        res.status(200).json(novoUser);
    } catch (error) {
        res.status(404).json({ message: "Erro Inesperado" });
        console.log(error);
    }
}

async function getMe(req, res) {
    try {

        const user = await User.findById(req.id);
        if (!user) {
            res.status(404).json({ message: "Usuário Não Encontrado" });
            return;
        }

        res.status(200).json(user.nome);
    } catch (error) {
        res.status(404).json({ message: "Erro Inesperado" });
        console.log(error);
    }
}
async function login(req, res) {
    try {
        const { email, senha } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            res.status(401).json({ message: "Usuário Inexistente" });
            return;
        }

        const isPassword = await bcrypt.compare(senha, user.senha);

        if (!isPassword) {
            res.status(404).json({ message: "Senha Incorreta" });
            return;
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_USER_SECRET);

        res.status(200)
            .cookie('Usertoken', token, {
                httpOnly: true,
                secure: process.env.JWT_USER_SECRET === 'production', // Ativa secure apenas em produção (HTTPS)
                sameSite: 'Strict', // Proteção CSRF
                maxAge: 3600000 // 1 hora
            })
            .json({
                message: 'Usuário Logado',
            });
        return;
    } catch (error) {
        res.status(404).json({ message: "Erro Inesperado" });
        console.log(error);
    }
}

async function logout(req, res) {
    try {
        res.status(200).clearCookie('Usertoken').json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
        res.status(404).json({ message: "Erro Inesperado" });
        console.log(error);
    }
}

export default {getAll, create, getMe, login, logout};