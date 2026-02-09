import express from 'express';
import * as categorie_controller from '../controllers/category.controller.js';
import { isTokenValid } from '../utils/token.util.js';
const router = express.Router();

/**
 * @swagger
 * /category/list:
 *  get:
 *    security:
 *      - Bearer: []
 *    produces:
 *      - application/json
 *    description: Get the list of all categories and their respective environments.
 *    tags:
 *      - Category
 *    responses:
 *      200:
 *        description: List of categories of environments.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: array
 *              items:
 *                type: object
 *                $ref: '#/definitions/category'
 *      401:
 *        description: JsonWebTokenError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/JsonWebTokenError'
 */
router.get('/list', isTokenValid, (req, res) =>
  categorie_controller.list(req, res)
);

export default router;

/**
 * @swagger
 * definitions:
 *  category:
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
 *  MissingArgumentError:
 *    properties:
 *      result:
 *        type: object
 *        properties:
 *          error:
 *            type: string
 *            example: "MissingArgumentError"
 *          message:
 *            type: string
 *            example: "The token is missing."
 *  JsonWebTokenError:
 *    properties:
 *      result:
 *        type: object
 *        properties:
 *          error:
 *            type: string
 *            example: "JsonWebTokenError"
 *          message:
 *            type: string
 *            example: "jwt malformed"
 */
