
import jwt from "jsonwebtoken";

async function CheckAdminToken(req, res, next) {
    try {
        const token = req.cookies.token

        if(!token){
            res.status(401)
                .json({message: 'Login Expirado'})
            return
        }

        const decoded = await jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        req.id = decoded;
        next();
    } catch (error) {
        res.status(403)
            .json({ message: "Token inválido" });
        return
    }
}

async function CheckUserToken(req, res, next) {
    try {
        const token = req.cookies.Usertoken;

        if (!token) {
            res.status(401).json({ message: 'Login Expirado' });
            return;
        }

        const decoded = await jwt.verify(token, process.env.JWT_USER_SECRET);
        req.id = decoded.id; // Extrair o campo id
        next();
    } catch (error) {
        res.status(403).json({ message: "Token inválido" });
        return;
    }
}

export default { CheckAdminToken, CheckUserToken }