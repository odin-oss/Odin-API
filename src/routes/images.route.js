/**
 * Package route
 *
 * @module route/auth
 */

import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as images_controller from '../controllers/images.controller.js';
import * as password_service from '../utils/password.service.js';
import * as token_service from '../utils/token.service.js';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../images')); // destination folder
  },
  filename: async function (req, file, cb) {
    // Custom filename: e.g., timestamp-originalname
    const uniqueSuffix = await Promise.resolve(
      password_service.generate_unique_hash()
    );
    const ext = path.extname(file.originalname); // preserve original file extension

    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });
const router = express.Router();
/**
 * @swagger
 *  /img/list:
 *    get:
 *      description: Get list of images.
 *      produces:
 *        - image/png
 *      tags:
 *        - Image
 */
router.get('/list', function (req, res) {
  images_controller.list(req, res);
});
/**
 * @swagger
 *  /img/{key}:
 *    get:
 *      description: Get specific image from tag.
 *      produces:
 *        - image/png
 *      tags:
 *        - Image
 *      parameters:
 *        - in: path
 *          name: key
 *          schema:
 *            type: string
 *          required: true
 *          description: Key of corresponding image in router
 */
router.get('/:key', function (req, res) {
  images_controller.get(req, res);
});

/**
 * @swagger
 *  /img/:
 *    post:
 *      description: Upload a new image on the server.
 *      produces: 
 *        - application/json
 *      tags: 
 *        - Image
 *    responses:
 *      200:
 *        description: Information about the uploaded file.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/upload'

 */
router.post(
  '/',
  token_service.isAdmin,
  upload.single('image'),
  images_controller.upload
);

export default router;
/**
 * @swagger
 * definitions:
 *  upload:
 *    properties:
 *      id_category:
 *        type: integer
 *      label:
 *        type: string
 *      environments:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            id_environment:
 *              type: integer
 *            label:
 *              type: string
 *            interfaces:
 *              type: array
 *              items:
 *                type: object
 */
