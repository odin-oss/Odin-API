import express from 'express';
import * as agents_controller from '../controllers/agents.controller.js';
import { isAdmin, isTokenValid } from '../utils/token.util.js';
const router = express.Router();

/**
 * @swagger
 * /agent/:
 *  post:
 *    description: Connect a new Agent into the system.
 *    security:
 *     - Bearer: []
 *    tags:
 *    - Agent
 *    produces:
 *    - application/json
 *    parameters:
 *    - name: label
 *      description: The new Agent's label.
 *      in: formData
 *      required : true
 *      type: string
 *    - name: type
 *      description: The new Agent's type. (kubernetes, docker, etc.)
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
router.post('/', (req, res) => {
  agents_controller.create(req, res);
});
//isTokenValid, isAdmin,
export default router;
