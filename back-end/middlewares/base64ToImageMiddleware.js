import { Buffer } from 'buffer';
import { fileTypeFromBuffer } from 'file-type';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.join(__dirname, '../static/images');

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // ~2MB

async function saveBase64Image(base64Input) {
    let base64 = base64Input;
    const dataUrlMatch = base64.match(/^data:image\/[a-zA-Z+]+;base64,/);
    if (dataUrlMatch) {
        base64 = base64.slice(dataUrlMatch[0].length);
    }

    const buffer = Buffer.from(base64, 'base64');

    if (buffer.length > MAX_IMAGE_BYTES) {
        const err = new Error('Imagem excede o limite de 2MB');
        err.status = 400;
        throw err;
    }

    const extensionName = await fileTypeFromBuffer(buffer);

    if (!extensionName || !['jpg', 'jpeg', 'png', 'tiff', 'webp'].includes(extensionName.ext)) {
        const err = new Error('Formato de imagem inválido');
        err.status = 400;
        throw err;
    }

    await fsPromises.mkdir(imagesDir, { recursive: true });

    const imageFilename = `${uuid()}.${extensionName.ext}`;
    const imagePath = path.join(imagesDir, imageFilename);

    await fsPromises.writeFile(imagePath, buffer);

    return imageFilename;
}

async function deleteImageFile(filename) {
    if (!filename || typeof filename !== 'string') return;
    // Defesa contra path traversal: só aceita basename
    const safeName = path.basename(filename);
    if (safeName !== filename) return;
    try {
        await fsPromises.unlink(path.join(imagesDir, safeName));
    } catch {
        // ignora: arquivo pode não existir
    }
}

const imageSavingMiddleware = async (req, res, next) => {
    try {
        if (!req.body.imagem || typeof req.body.imagem !== 'string') {
            return res.status(400).json({ error: 'É necessário enviar uma imagem em base64' });
        }

        const imageFilename = await saveBase64Image(req.body.imagem);

        req.uuid = imageFilename;
        next();
    } catch (error) {
        if (error && error.status === 400) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ message: 'Erro inesperado' });
        console.log(error);
    }
};

export default imageSavingMiddleware;
export { saveBase64Image, deleteImageFile };
