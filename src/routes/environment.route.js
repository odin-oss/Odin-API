import express from 'express';
import * as environment_controller from '../controllers/environment.controller.js';
import { isAdmin, isTokenValid } from '../utils/token.util.js';
const router = express.Router();

/**
 * @swagger
 * /environment/list:
 *  get:
 *    security:
 *      - Bearer: []
 *    description: Get all environments available.
 *    produces:
 *      - application/json
 *    tags:
 *      - Environment
 *    responses:
 *      200:
 *        description: List of available environments.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: array
 *              items:
 *                type: object
 *                $ref: '#/definitions/environment'
 *      401:
 *        description: MissingArgumentError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/MissingArgumentError'

 */
router.get('/list', isTokenValid, (req, res) =>
  environment_controller.list(req, res)
);
/**
 * @swagger

 * /environment/:
 *  post:
 *    description: Adds a new Environment into the database.
 *    security:
 *     - Bearer: []
 *    tags:
 *    - Environment
 *    produces:
 *    - application/json
 *    parameters:
 *    - name: label
 *      description: The new Environment's label.
 *      in: formData
 *      required : true
 *      type: string
 *    - name: icon
 *      description : The new Environment's id icon
 *      in: formData
 *      required : true
 *      type : string
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
 *           $ref: '#/definitions/DBObjectNotFoundEnvironment'
 *       500:
 *         description: DBConnexionRefused
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBConnexionRefused'
 */
router.post('/', isTokenValid, isAdmin, async (req, res) => {
  environment_controller.create(req, res);
});
/**
 * @swagger

 * /environment/{id_environment}/interface/:
 *  post:
 *    description: Adds an Interface into a Environment based on its ID.
 *    security:
 *     - Bearer: []
 *    tags:
 *    - Environment
 *    produces:
 *    - application/json
 *    parameters:
 *     - name: id_environment
 *       description: Numeric ID of the Environment to add an Interface into.
 *       in: path
 *       required : true
 *       type: string
 *     - name: id_interface
 *       description: Numeric ID of the Interface to add.
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
 *           $ref: '#/definitions/DBObjectNotFoundEnvironment'
 *       500:
 *         description: DBConnexionRefused
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBConnexionRefused'
 */
router.post(
  '/:id_environment/interface',
  isTokenValid,
  isAdmin,
  async (req, res) => {
    environment_controller.attach_interface(req, res);
  }
);
/**
 * @swagger

 * /environment/{id_environment}/interface:
 *  delete:
 *    description: Removes an Interface from an Environment based on its ID.
 *    security:
 *     - Bearer: []
 *    tags:
 *    - Environment
 *    produces:
 *    - application/json
 *    parameters:
 *     - name: id_environment
 *       description: Numeric ID of the Environment to remove an Interface from.
 *       in: path
 *       required : true
 *       type: string
 *     - name: id_interface
 *       description: Numeric ID of the Interface to remove.
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
 *           $ref: '#/definitions/DBObjectNotFoundEnvironment'
 *       500:
 *         description: DBConnexionRefused
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBConnexionRefused'
 */
router.delete(
  '/:id_environment/interface',
  isTokenValid,
  isAdmin,
  async (req, res) => {
    environment_controller.detach_interface(req, res);
  }
);
/**
 * @swagger

 * /environment/{id_environment}:
 *  put:
 *    description: Changes a Environment's label & icon based on its ID.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Environment
 *    produces:
 *     - apllcation/json
 *    parameters:
 *     - name: id_environment
 *       description: Numeric ID of the Environment to get.
 *       in: path
 *       required : true
 *       type: integer
 *     - name: label
 *       description: The Environment's new label.
 *       in: formData
 *       required : true
 *       type: string
 *     - name: icon
 *       description: The Environment's new icon.
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
 *           $ref: '#/definitions/DBObjectNotFoundEnvironment'
 *       500:
 *         description: DBConnexionRefused
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBConnexionRefused'
 */
router.put('/:id_environment/', isTokenValid, isAdmin, async (req, res) => {
  environment_controller.update(req, res);
});
/**
 * @swagger
 * /environment/{id_environment}/interface/:
 *  put:
 *    description: Changes a Interface's inner label in an Environment based on its ID.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Environment
 *    produces:
 *     - apllcation/json
 *    parameters:
 *     - name: id_environment
 *       description: Numeric ID of the Environment.
 *       in: path
 *       required : true
 *       type: integer
 *     - name: id_interface
 *       description: Numeric ID of the Interface.
 *       in: formData
 *       required : true
 *       type: integer
 *     - name: label
 *       description: The Interface's new label.
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
 *           $ref: '#/definitions/DBObjectNotFoundEnvironment'
 *       500:
 *         description: DBConnexionRefused
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBConnexionRefused'
 */
router.put(
  '/:id_environment/interface',
  isTokenValid,
  isAdmin,
  async (req, res) => {
    environment_controller.update_interface(req, res);
  }
);

/**
 * @swagger
 * /entironment/:
 *  delete:
 *    description: Deletes an Environment based on its ID.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Environment
 *    produces:
 *     - application/json
 *    parameters:
 *     - name: id_entironment
 *       description: Numeric ID of the Environment to delete.
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
 *           $ref: '#/definitions/DBObjectNotFoundEnvironment'
 *       500:
 *         description: DBConnexionRefused
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBConnexionRefused'
 */
router.delete('/', isTokenValid, isAdmin, async (req, res) => {
  environment_controller.del(req, res);
});

export default router;
/**
 * @swagger
 * definitions:
 *  environment:
 *    properties:
 *      id_environment:
 *        type: integer
 *      label:
 *        type: string
 *      icon:
 *        type: string
 *      interfaces:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            id_interface:
 *              type: integer
 *            label:
 *              type: string
 *            label_type_image:
 *              type: string
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
