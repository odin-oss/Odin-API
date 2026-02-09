/**
 * Package route
 *
 * @module route/auth
 */
import express from 'express';
import * as auth_controller from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @swagger
 * /auth/connect_by_credentials:
 *  post:
 *    description: Connect to Odin by using the credentials way.
 *    tags:
 *      - Authentication
 *    produces:
 *     - application/json
 *    parameters:
 *     - name: mail
 *       description: User's mail.
 *       in: formData
 *       required: true
 *       type: string
 *     - name: password
 *       description: User's password.
 *       in: formData
 *       required: true
 *       type: string
 *    responses:
 *       200:
 *         description: token
 *         schema:
 *           type: object
 *           $ref: '#/definitions/token'
 *       400:
 *         description: MissingArgumentError.
 *         schema:
 *           type: object
 *           $ref: '#/definitions/MissingArgumentError'
 *       403:
 *         description: BadCredentials.
 *         schema:
 *           type: object
 *           $ref: '#/definitions/BadCredentials'
 *       404:
 *         description: DBObjectNotFound.
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBObjectNotFound'
 *       500:
 *         description: DBConnexionRefused.
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBConnexionRefused'
 *
 */
router.post('/connect_by_credentials', (req, res) =>
  auth_controller.connect(req, res)
);

export default router;

/**
 * @swagger
 * definitions:
 *  token:
 *    properties:
 *      result:
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
 *            example: "The body parameter (password) is missing."
 *  BadCredentials:
 *    properties:
 *      result:
 *        type: object
 *        properties:
 *          error:
 *            type: string
 *            example: "BadCredentials"
 *          message:
 *            type: string
 *            example: "The credentials you entered are wrong."
 *  DBObjectNotFound:
 *    properties:
 *      result:
 *        type: object
 *        properties:
 *          error:
 *            type: string
 *            example: "DBObjectNotFound"
 *          message:
 *            type: string
 *            example: "The user could not be found."
 *  DBConnexionRefused:
 *    properties:
 *      result:
 *        type: object
 *        properties:
 *          error:
 *            type: string
 *            example: "DBConnexionRefused"
 *          message:
 *            type: string
 *            example: "Connexion to the database refused."
 */
