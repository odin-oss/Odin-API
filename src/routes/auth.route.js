/**
 * Package route
 *
 * @module route/auth
 */
import express from 'express';
import { connect } from '../controllers/auth.controller.js';
import { app_access_granted } from '../utils/token.util.js';
import { counter, counter_get } from '../middlewares/prometheus.js';

const router = express.Router();

/**
 * @swagger
 * /auth/app:
 *  get:
 *    description: Does the user have the access to the app ?
 *    security:
 *      - Bearer: []
 *    tags:
 *      - Authentication
 *    produces:
 *      - application/json
 *    parameters:
 *     - name: hash
 *       description: Application's hash.
 *       in: query
 *       required: true
 *       type: integer
 *     - name: token
 *       description: User's personal token.
 *       in: query
 *       required: true
 *       type: integer
 *    responses:
 *       200:
 *         description: true if access is authorized.
 *
 */
router.get('/:hash/*', function (req, res) {
  counter.inc();
  counter_get.inc();
  app_access_granted(req, res);
});

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
router.post('/connect_by_credentials', (req, res) => connect(req, res));

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
