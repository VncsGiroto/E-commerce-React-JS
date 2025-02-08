import { Buffer } from 'buffer';
import { fileTypeFromBuffer } from 'file-type';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.join(__dirname, '../static/images');

const imageSavingMiddleware = async (req, res, next) => {
    try {
        if (!req.body.imagem || typeof req.body.imagem !== 'string') {
            return res.status(400).json({ error: 'É necessário enviar uma imagem em base64' });
        }

        const buffer = Buffer.from(req.body.imagem, 'base64');
        const extensionName = await fileTypeFromBuffer(buffer);

        if (!extensionName || !['jpg', 'jpeg', 'png', 'tiff', 'webp'].includes(extensionName.ext)) {
            return res.status(400).json({ error: 'Formato de imagem inválido' });
        }

        const imageFilename = `${uuid()}.${extensionName.ext}`;
        const imagePath = path.join(imagesDir, imageFilename);

        await fsPromises.writeFile(imagePath, buffer);

        req.uuid = imageFilename;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erro inesperado' });
        console.log(error);
    }
};

export default imageSavingMiddleware;
