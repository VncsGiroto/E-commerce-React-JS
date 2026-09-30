import User from "../models/User.js";
import bcrypt from "bcrypt"
import 'dotenv/config'
import jwt from "jsonwebtoken";
import { getPagination, paginatedResponse } from "../middlewares/pagination.js";

function sanitizeUser(userDoc) {
    const obj = userDoc.toObject();
    delete obj.senha;
    return obj;
}

async function getAll(req, res){
    try {
        const pagination = getPagination(req.query);
        if (!pagination) {
            const users = await User.find().select('-senha');
            return res.status(200).json(users);
        }
        const { page, limit, skip } = pagination;
        const total = await User.countDocuments();
        const users = await User.find().select('-senha').skip(skip).limit(limit);
        res.status(200)
            .json(paginatedResponse({ data: users, total, page, limit }));
    } catch (error) {
        res.status(500)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function create(req, res) {
    try {
        const { nome, email, senha } = req.body;
        const user = await User.findOne({ email: email });
        if (user) {
            res.status(409).json({ message: "Usuário Já Existente" });
            return;
        }

        const hash = await bcrypt.hash(senha, 12);
        const novoUser = new User({
            nome,
            email,
            senha: hash
        });
        await novoUser.save();
        res.status(201).json(sanitizeUser(novoUser));
    } catch (error) {
        res.status(500).json({ message: "Erro Inesperado" });
        console.log(error);
    }
}

async function getMe(req, res) {
    try {

        const user = await User.findById(req.id).select('-senha');
        if (!user) {
            res.status(404).json({ message: "Usuário Não Encontrado" });
            return;
        }

        res.status(200).json({ _id: user._id, nome: user.nome, email: user.email });
    } catch (error) {
        res.status(500).json({ message: "Erro Inesperado" });
        console.log(error);
    }
}
async function login(req, res) {
    try {
        const { email, senha } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            res.status(401).json({ message: "Credenciais inválidas" });
            return;
        }

        const isPassword = await bcrypt.compare(senha, user.senha);

        if (!isPassword) {
            res.status(401).json({ message: "Credenciais inválidas" });
            return;
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_USER_SECRET, { expiresIn: '1h' });

        res.status(200)
            .cookie('Usertoken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Ativa secure apenas em produção (HTTPS)
                sameSite: 'Strict', // Proteção CSRF
                maxAge: 3600000 // 1 hora
            })
            .json({
                message: 'Usuário Logado',
            });
        return;
    } catch (error) {
        res.status(500).json({ message: "Erro Inesperado" });
        console.log(error);
    }
}

async function logout(req, res) {
    try {
        res.status(200).clearCookie('Usertoken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/',
        }).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: "Erro Inesperado" });
        console.log(error);
    }
}

export default {getAll, create, getMe, login, logout};
