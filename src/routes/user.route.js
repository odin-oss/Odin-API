import express from 'express';
import * as user_controller from '../controllers/user.controller.js';
import { isAdmin, isTokenValid } from '../utils/token.util.js';
const router = express.Router();
/**
 * @swagger
 * definitions:
 *  user:
 *    properties:
 *      id_user:
 *        type: integer
 *      lastname:
 *        type: string
 *      firstname:
 *        type: string
 *      mail:
 *        type: string
 *      role:
 *        type: string
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
/**
 * @swagger
 * /user/me:
 *  get:
 *    produces:
 *      - application/json
 *    description: Get informations about yourself.
 *    tags:
 *      - User
 *    security:
 *      - Bearer: []
 *    responses:
 *      200:
 *        description: User's informations.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/user'
 *      401:
 *        description: MissingArgumentError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/MissingArgumentError'
 */
router.get('/me', isTokenValid, (req, res) => user_controller.me(req, res));

/**
 * @swagger
 * /user/password:
 *  put:
 *    produces:
 *      - application/json
 *    description: Update the current user's password.
 *    tags:
 *      - User
 *    security:
 *      - Bearer: []
 *    parameters:
 *     - name: password
 *       description: New password.
 *       in: body
 *       required: true
 *       type: string
 *    responses:
 *      200:
 *        description: User's informations.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/user'
 *      401:
 *        description: MissingArgumentError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/MissingArgumentError'
 */
router.put('/password', isTokenValid, (req, res) =>
  user_controller.update_password(req, res)
);

/**
 * @swagger
 * /user/list_by_role:
 *  get:
 *    produces:
 *      - application/json
 *    description: Get the list of all the users.
 *    tags:
 *      - User
 *    security:
 *      - Bearer: []
 *    parameters:
 *      - name: role
 *        description: Role of users to filter.
 *        in: formData
 *        required: true
 *        type: string
 *    responses:
 *      200:
 *        description: User's informations.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: Array
 *              items:
 *                type: object
 *                $ref: '#/definitions/user'
 *      401:
 *        description: MissingArgumentError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/MissingArgumentError'
 */
router.get('/list_by_role', isTokenValid, isAdmin, (req, res) =>
  user_controller.list(req, res)
);

/**
 * @swagger
 * /user/create:
 *  post:
 *    produces:
 *      - application/json
 *    description: Create a new user account.
 *    tags:
 *      - User
 *    security:
 *      - Bearer: []
 *    parameters:
 *     - name: role
 *       description: Role of the new user.
 *       in: query
 *       required: true
 *       type: string
 *     - name: firstname
 *       description: Firstname of the new user.
 *       in: query
 *       required: true
 *       type: string
 *     - name: lastname
 *       description: Lastname of the new user.
 *       in: query
 *       required: true
 *       type: string
 *     - name: mail
 *       description: Mail of the new user.
 *       in: query
 *       required: true
 *       type: string
 *     - name: password
 *       description: Password of the new user.
 *       in: query
 *       required: true
 *       type: string
 *    responses:
 *      200:
 *        description: Array of User's informations.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: array
 *              items:
 *                type: object
 *                $ref: '#/definitions/user'
 *      401:
 *        description: MissingArgumentError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/MissingArgumentError'
 */
router.post('/create', isTokenValid, isAdmin, (req, res) =>
  user_controller.create(req, res)
);
export default router;
