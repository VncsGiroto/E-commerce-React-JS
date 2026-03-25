import vine, { SimpleMessagesProvider} from "@vinejs/vine";

const messages = {
    string: 'O campo precisa ser um texto.',
    minLength: 'O campo precisa ser prenchido.',
    number: 'O campo precisa ser um número.',
    positive: 'O campo precisa ser um número positivo.',
    email: 'O campo precisa ser um email válido.',
}
vine.messagesProvider = new SimpleMessagesProvider(messages)

async function ProdutoCreateValidate(req, res, next){

    const data = req.body;
    const schema = vine.object({
        nome: vine.string().minLength(1),
        imagem: vine.string().minLength(1),
        descricao: vine.string().minLength(1), 
        categoria: vine.string().minLength(1),
        preco: vine.number().positive(),
    })
    try {
        await vine.validate({schema, data})
        next();
    } catch (error) {
        res.status(403).json(error.messages)
    }

}

async function ProdutoUpdateValidate(req, res, next){

    const data = req.body;
    const schema = vine.object({
        nome: vine.string().minLength(1),
        descricao: vine.string().minLength(1), 
        categoria: vine.string().minLength(1),
        preco: vine.number().positive(),
    })
    try {
        await vine.validate({schema, data})
        next();
    } catch (error) {
        res.status(403).json(error.messages)
    }

}

async function UserCreateValidate(req, res, next) {
    const data = req.body;
    const schema = vine.object({
        nome: vine.string().minLength(1),
        email: vine.string().email().minLength(1),
        senha: vine.string().minLength(6),
    });
    try {
        await vine.validate({ schema, data });
        next();
    } catch (error) {
        res.status(403).json(error.messages);
    }
}

async function UserLoginValidate(req, res, next) {
        const data = req.body;
    const schema = vine.object({
        email: vine.string().email().minLength(1),
        senha: vine.string().minLength(6),
    });
    try {
        await vine.validate({ schema, data });
        next();
    } catch (error) {
        res.status(403).json(error.messages);
    }
}

async function CartValidate(req, res, next) {
    const data = req.body.items;
    const schema = vine.array(
        vine.object({
            produtoId: vine.string().minLength(1),
            quantidade: vine.number().positive(),
        })
    );
    try {
        await vine.validate({ schema, data });
        next();
    } catch (error) {
        res.status(403).json(error.messages);
    }
}

export default {ProdutoUpdateValidate, ProdutoCreateValidate, UserCreateValidate, UserLoginValidate, CartValidate}