import vine, { SimpleMessagesProvider} from "@vinejs/vine";

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

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
        categoriaId: vine.string().minLength(1).regex(OBJECT_ID_REGEX),
        preco: vine.number().min(0),
    })
    try {
        await vine.validate({schema, data})
        next();
    } catch (error) {
        res.status(400).json(error.messages)
    }

}

async function ProdutoUpdateValidate(req, res, next){

    const data = req.body;
    const schema = vine.object({
        _id: vine.string().minLength(1).regex(OBJECT_ID_REGEX),
        nome: vine.string().minLength(1).optional(),
        imagem: vine.string().minLength(1).optional(),
        descricao: vine.string().minLength(1).optional(),
        categoriaId: vine.string().minLength(1).regex(OBJECT_ID_REGEX).optional(),
        preco: vine.number().min(0).optional(),
    })
    try {
        await vine.validate({schema, data})
        next();
    } catch (error) {
        res.status(400).json(error.messages)
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
        res.status(400).json(error.messages);
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
        res.status(400).json(error.messages);
    }
}

async function CartValidate(req, res, next) {
    if (req.body.items === undefined) {
        return res.status(400).json({ message: "Campo 'items' é obrigatório" });
    }
    const data = req.body.items;
    const schema = vine.array(
        vine.object({
            produtoId: vine.string().minLength(1).regex(OBJECT_ID_REGEX),
            quantidade: vine.number().min(1).max(999).withoutDecimals(),
        })
    );
    try {
        await vine.validate({ schema, data });
        next();
    } catch (error) {
        res.status(400).json(error.messages);
    }
}

export default {ProdutoUpdateValidate, ProdutoCreateValidate, UserCreateValidate, UserLoginValidate, CartValidate}
