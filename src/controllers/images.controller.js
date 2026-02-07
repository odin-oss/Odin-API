import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as parameters_service from '../utils/parametres.service.js';
import logs from '../middlewares/winston.js';
import {
  ImageNotFound,
  NoImageReceived,
  ReadingImageError,
} from '../utils/errors.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Function that controls whatever enter the route and send the image back from local storage.
 * @param {*} req
 * @param {*} res
 */
export const get = async function (req, res) {
  try {
    parameters_service.check_params(req, ['key']);
    const imagePath = path.join(
      __dirname,
      '../../images/img-' + req.params.key + '.png'
    );
    try {
      await fs.access(imagePath, fs.constants.F_OK);
      logs.info(`[${req.method}][200] ${req.originalUrl} : Image transmitted.`);
      res.sendFile(imagePath);
    } catch (err) {
      if (err.message.includes('ENOENT'))
        throw new ImageNotFound(
          'The image ' + req.params.key + '.png does not exist.'
        );
      else throw new ReadingImageError(err.message);
    }
  } catch (err) {
    logs.error(
      `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}`
    );
    res.status(err.code).json({
      result: {
        error: err.name,
        message: err.message,
      },
    });
  }
};
/**
 * Function that list all the images in the ms.
 * @param {*} req
 * @param {*} res
 */
export const list = async function (req, res) {
  try {
    const imagesDir = path.join(__dirname, '../../images');
    const files = await fs.readdir(imagesDir);

    const keys = files
      .filter((file) => file.startsWith('img-') && file.endsWith('.png'))
      .map((file) => file.slice(4, -4));

    logs.info(
      `[${req.method}][200] ${req.originalUrl} : List of images transmitted.`
    );

    res.status(200).json({
      result: keys,
    });
  } catch (err) {
    logs.error(
      `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}`
    );
    res.status(err.code).json({
      result: {
        error: err.name,
        message: err.message,
      },
    });
  }
};
/**
 * Function that controls whatever enter the route and send the image back from local storage.
 * @param {*} req
 * @param {*} res
 */
export const upload = function (req, res) {
  try {
    if (!req.file)
      throw new NoImageReceived('No image received by the controller.');
    const result = req.file;
    result.hash = req.file.filename.replace('.png', '').replace('img-', '');
    logs.info(`[${req.method}][200] ${req.originalUrl} : Image uploaded.`);
    res.status(200).json({ result: req.file });
  } catch (err) {
    logs.error(
      `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}`
    );
    res.status(err.code).json({
      result: {
        error: err.name,
        message: err.message,
      },
    });
  }
};
