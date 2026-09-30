import rateLimit from "express-rate-limit";

// Limite geral contra abuso da API
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

// Limite estrito para endpoints de login (anti brute-force)
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: "Muitas tentativas de login. Tente novamente em 15 minutos." },
});
