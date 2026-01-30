import express from 'express';
import * as datacenter_controller from '../controllers/datacenter.controller.js';
import { isTokenValid } from '../utils/token.service.js';

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
