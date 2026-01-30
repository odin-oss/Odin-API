import express from 'express';
import * as environment_controller from '../controllers/environment.controller.js';
import { isTokenValid } from '../utils/token.service.js';
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
