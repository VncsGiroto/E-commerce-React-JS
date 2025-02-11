import vine, { SimpleMessagesProvider} from "@vinejs/vine";

const messages = {
    string: 'O campo precisa ser um texto.',
    minLength: 'O campo precisa ser prenchido.',
    number: 'O campo precisa ser um número.',
    positive: 'O campo precisa ser um número positivo.',
    email: 'O campo precisa ser um email válido.',
}
vine.messagesProvider = new SimpleMessagesProvider(messages)

async function ProdutoValidate(req, res, next){

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


async function UserValidate(req, res, next) {
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

export default {ProdutoValidate, UserValidate}