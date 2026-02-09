import express from 'express';
import * as storage_controller from '../controllers/storage.controller.js';
import { isOwner } from '../utils/token.util.js';

const router = express.Router();

/**
 * @swagger
 * /application/storage/export:
 *  post:
 *    tags:
 *     - Application Storage
 *    description: Export application data.
 *    produces:
 *     - application/json
 *    security:
 *     - Bearer: []
 *    parameters:
 *     - name: id_application
 *       description: application's id.
 *       in: query
 *       required: true
 *       type: integer
 *     - name: export_platform
 *       description: the export platform
 *       in : formData
 *       required: true
 *       type: string
 *     - name: delete_existing_export
 *       description: delete an existing export
 *       default: false
 *       in : formData
 *       required: false
 *       type: boolean
 *    responses:
 *      200:
 *        description: The export has been launched.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/application_export'
 *      401:
 *        description: MissingArgumentError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/MissingArgumentError'
 *      500:
 *        description: DBConnexionRefused.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/DBConnexionRefused'
 */
router.post('/export', isOwner, (req, res) =>
  storage_controller.exportStorage(req, res)
);

/**
 * @swagger
 * /application/storage/export:
 *  delete:
 *    tags:
 *     - Application Storage
 *    description: Delete an application export.
 *    produces:
 *     - application/json
 *    security:
 *     - Bearer: []
 *    parameters:
 *     - name: id_application
 *       description: application's id.
 *       in: query
 *       required: true
 *       type: integer
 *     - name: export_id
 *       description: export's id.
 *       in: formData
 *       required: true
 *       type: integer
 *     - name: export_platform
 *       description: the export platform
 *       in : formData
 *       required: true
 *       type: string
 *    responses:
 *      200:
 *        description: The export has been deleted.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/application_export'
 *      401:
 *        description: MissingArgumentError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/MissingArgumentError'
 *      500:
 *        description: DBConnexionRefused.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/DBConnexionRefused'
 */
router.delete('/export', isOwner, (req, res) =>
  storage_controller.deleteStorage(req, res)
);

/**
 * @swagger
 * /application/storage/export:
 *  get:
 *    tags:
 *     - Application Storage
 *    description: Get the latest application export .
 *    produces:
 *     - application/json
 *    security:
 *     - Bearer: []
 *    parameters:
 *     - name: id_application
 *       description: application's id.
 *       in: query
 *       required: true
 *       type: integer
 *    responses:
 *      200:
 *        description: The export informations.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/application_export'
 *      401:
 *        description: MissingArgumentError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/MissingArgumentError'
 *      500:
 *        description: DBConnexionRefused.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/DBConnexionRefused'
 */
router.get('/export', isOwner, (req, res) =>
  storage_controller.getStorage(req, res)
);

export default router;

/**
 * @swagger
 * definitions:
 *  application_export:
 *    properties:
 *     id_export:
 *      type: integer
 *     id_application:
 *       type: integer
 *     init_date:
 *       type: string
 *     expiration_date:
 *       type: string
 *     id_enum_export_state:
 *       type: integer
 *     status:
 *       type: string
 *     download_link:
 *      type: string
 *     previous_export_deleted:
 *       type: boolean

 *

   */
