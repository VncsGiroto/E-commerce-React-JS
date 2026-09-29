
import jwt from "jsonwebtoken";

function extractId(decoded) {
    if (decoded && typeof decoded === 'object' && decoded.id !== undefined) {
        return decoded.id;
    }
    return decoded;
}

function CheckAdminToken(req, res, next) {
    try {
        const token = req.cookies.token

        if(!token){
            res.status(401)
                .json({message: 'Login Expirado'})
            return
        }

        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        req.id = extractId(decoded);
        next();
    } catch (error) {
        if (error && error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Login Expirado" });
        }
        res.status(403)
            .json({ message: "Token inválido" });
        return
    }
}

function CheckUserToken(req, res, next) {
    try {
        const token = req.cookies.Usertoken;

        if (!token) {
            res.status(401).json({ message: 'Login Expirado' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
        req.id = extractId(decoded); // Extrair o campo id
        next();
    } catch (error) {
        if (error && error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Login Expirado" });
        }
        res.status(403).json({ message: "Token inválido" });
        return;
    }
}

export default { CheckAdminToken, CheckUserToken }
