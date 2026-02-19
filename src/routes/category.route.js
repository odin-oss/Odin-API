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
/**
 * @swagger

 * /category/{id_category}/environment/:
 *  delete:
 *    description: Removes an Environment from a Category based on its ID.
 *    security:
 *     - Bearer: []
 *    tags:
 *    - Category
 *    produces:
 *    - application/json
 *    parameters:
 *     - name: id_category
 *       description: Numeric ID of the Category to remove an Environment from.
 *       in: path
 *       required : true
 *       type: string
 *     - name: id_environment
 *       description: Numeric ID of the Environment to remove.
 *       in: formData
 *       required : true
 *       type: integer
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
router.delete(
  '/:id_category/environment',
  isTokenValid,
  isAdmin,
  (req, res) => {
    category_controller.detach_environment(req, res);
  }
);

/**
 * @swagger

 * /category/{id_category}/environment/:
 *  post:
 *    description: Adds an Environment into a Category based on its ID.
 *    security:
 *     - Bearer: []
 *    tags:
 *    - Category
 *    produces:
 *    - application/json
 *    parameters:
 *     - name: id_category
 *       description: Numeric ID of the Category to add an Environment into.
 *       in: path
 *       required : true
 *       type: string
 *     - name: id_environment
 *       description: Numeric ID of the Environment to add.
 *       in: formData
 *       required : true
 *       type: integer
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
router.post('/:id_category/environment', isTokenValid, isAdmin, (req, res) => {
    category_controller.attach_environment(req, res);
});


/**
 * @swagger

 * /category/{id_category}/:
 *  put:
 *    description: Changes a Category's label based on its ID.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Category
 *    produces:
 *     - apllcation/json
 *    parameters:
 *     - name: id_category
 *       description: Numeric ID of the Category to get.
 *       in: path
 *       required : true
 *       type: integer
 *     - name: label
 *       description: The Category's new label.
 *       in: formData
 *       required : true
 *       type: string
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
router.put('/:id_category', isTokenValid, isAdmin, (req, res) => {
    category_controller.update(req, res);
});

/**
 * @swagger

 * /category/:
 *  delete:
 *    description: Deletes a Category based on its ID.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Category
 *    produces:
 *     - application/json
 *    parameters:
 *     - name: id_category
 *       description: Numeric ID of the Category to delete.
 *       in : formData
 *       required: true
 *       type: integer
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
router.delete('/', isTokenValid, isAdmin, (req, res) => {
    category_controller.del(req, res);
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
