import express from 'express';
import * as nodeSelector_controller from '../controllers/nodeSelector.controller.js';
import { isAdmin, isTokenValid } from '../utils/token.util.js';
const router = express.Router();

/**
 * @swagger
 * /nodeSelector/list:
 *  get:
 *    description: Gets the list of node selector.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Node Selector
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
  nodeSelector_controller.list(req, res);
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
