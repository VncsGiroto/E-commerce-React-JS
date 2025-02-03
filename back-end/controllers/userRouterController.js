
async function getAll(req, res){
    try {
        res.status(200)
            .json({message: "ola"});
    } catch (error) {
        res.status(404)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}

async function create(req,res){
    try {
        res.status(200)
            .json({message: "ola"});
    } catch (error) {
        res.status(404)
            .json({message: "Erro Inesperado"})
        console.log(error);
    }
}


export default {getAll, create};