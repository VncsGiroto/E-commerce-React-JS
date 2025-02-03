
import jwt from "jsonwebtoken";

async function CheckAdminToken(req, res, next) {
    const token = req.cookies.token

    if(!token){
        return res.status(401)
                .json({message: 'Login Expirado'})
    }
    try {
        const decoded = await jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        req.id = decoded;
        next();
    } catch (error) {
        return res.status(403)
                .json({ message: "Token inválido" });
    }
}