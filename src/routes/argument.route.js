import express from 'express';
import * as argument_controller from '../controllers/argument.controller.js';
import { isTokenValid, isAdmin } from '../utils/token.util.js';
const router = express.Router();

/**
 * @swagger
 * /argument/list:
 *  get:
 *    description: Gets the list of argument.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Argument
 *    produces:
 *     - application/json
 *    responses :
 *       200:
 *         description: OK
 *         schema:
 *           type: object
 *           $ref: '#/definitions/OK'
 *       401:
 *         description: UnauthorizedError
 *         schema:
 *           type: object
 *           $ref: '#/definitions/UnauthorizedError'
 *       500:
 *         description: DBConnexionRefused
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBConnexionRefused'
 */

router.get('/list', isTokenValid, isAdmin, async (req, res) => {
  argument_controller.list(req, res);
});

/**
 * @swagger
 * definitions:
 *   DBObjectNotFoundInterface:
 *     type: object
 *     properties:
 *       result:
 *         type: object
 *         properties:
 *           error:
 *             type: string
 *             example: "DBObjectNotFound"
 *           message:
 *             type: string
 *             example: "The interface could not be found."
 */

export default router;
