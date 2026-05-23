import express from 'express';
import * as datacenter_controller from '../controllers/datacenter.controller.js';
import { isAdmin, isTokenValid } from '../utils/token.util.js';

const router = express.Router();

/**
 * @swagger
 * /datacenter/list:
 *  get:
 *    tags:
 *     - Datacenter
 *    description: Get all the available datacenters.
 *    produces:
 *     - application/json
 *    security:
 *     - Bearer: []
 *    responses:
 *      200:
 *        description: Datacenter's infos.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/datacenter'
 */
router.get('/list', isTokenValid, (req, res) =>
  datacenter_controller.list(req, res)
);
/**
 * @swagger
 * /datacenter/:
 *  post:
 *    description: Create a new datacenter.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Datacenter
 *    produces:
 *     - application/json
 *    responses :
 *       200:
 *         description: datacenter created
 *         schema:
 *           type: object
 *           $ref: '#/definitions/datacenter'
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
router.post('/', isTokenValid, isAdmin, (req, res) => {
  datacenter_controller.create(req, res);
});

/**
 * @swagger
 * /datacenter/:id_datacenter:
 *  put:
 *    description: Update a datacenter.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Datacenter
 *    produces:
 *     - application/json
 *    responses :
 *       200:
 *         description: datacenter created
 *         schema:
 *           type: object
 *           $ref: '#/definitions/datacenter'
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
router.put('/:id_datacenter', isTokenValid, isAdmin, (req, res) => {
  datacenter_controller.update(req, res);
});

/**
 * @swagger

 * /datacenter/:id_datacenter:
 *  delete:
 *    description: Delete a datacenter.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Datacenter
 *    produces:
 *     - application/json
 *    responses :
 *       200:
 *         description: datacenter deleted
 *         schema:
 *           type: object
 *           $ref: '#/definitions/datacenter'
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
router.delete('/:id_datacenter', isTokenValid, isAdmin, (req, res) => {
  datacenter_controller.del(req, res);
});

/**
 * @swagger

 * /datacenter/:id_datacenter:
 *  get:
 *    description: Get a datacenter.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Datacenter
 *    produces:
 *     - application/json
 *    responses :
 *       200:
 *         description: datacenter transmitted
 *         schema:
 *           type: object
 *           $ref: '#/definitions/datacenter'
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
router.get('/:id_datacenter', isTokenValid, isAdmin, (req, res) => {
  datacenter_controller.get(req, res);
});

/**
 * @swagger
 * /datacenter/:id_datacenter/agent/:id_agent:
 *  post:
 *    description: Attributes an agent to a datacenter.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Datacenter
 *    produces:
 *     - application/json
 *    responses :
 *       200:
 *         description: agent added to datacenter
 *         schema:
 *           type: object
 *           $ref: '#/definitions/datacenter'
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
router.post(
  '/:id_datacenter/agent/:id_agent',
  isTokenValid,
  isAdmin,
  (req, res) => {
    datacenter_controller.addAgent(req, res);
  }
);

export default router;
/**
 * @swagger
 * definitions:
 *  datacenter:
 *    properties:
 *      id_datacenter:
 *        type: integer
 *      label:
 *        type: string
 *      provider:
 *        type: string
 *      city:
 *        type: string
 */
