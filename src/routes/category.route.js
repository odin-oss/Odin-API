import express from 'express';
import * as category_controller from '../controllers/category.controller.js';
import { isAdmin, isTokenValid } from '../utils/token.util.js';
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
  category_controller.list(req, res)
);
/**
 * @swagger

 * /category/:
 *  post:
 *    description: Adds a new Category into the database.
 *    security:
 *     - Bearer: []
 *    tags:
 *    - Category
 *    produces:
 *    - application/json
 *    parameters:
 *    - name: label
 *      description: The new Category's label.
 *      in: formData
 *      required : true
 *      type: string
 *    - name: google_material_icon
 *      description: The new Category's Google material icon.
 *      in: formData
 *      required : true
 *      type: string
 *    responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: object
 *           $ref: '#/definitions/OK'
 *       400:
 *         description: MissingArgumentError
 *         schema:
 *           type: object
 *           $ref: '#/definitions/MissingArgumentError'
 *       404:
 *         description: DBObjectNotFound
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBObjectNotFound'
 *       500:
 *         description: DBConnexionRefused
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBConnexionRefused'
 */
router.post('/', isTokenValid, isAdmin, (req, res) => {
  category_controller.create(req, res);
});

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
