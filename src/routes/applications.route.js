import express from 'express';
import * as applications_controller from '../controllers/applications.controller.js';
import { isTokenValid, isOwner, isAdmin } from '../utils/token.service.js';

const router = express.Router();

/**
 * @swagger
 * /application/list:
 *  get:
 *    description: Get all the applications of the current user.
 *    produces:
 *     - application/json
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Application
 *    responses:
 *      200:
 *        description: Liste des applications attitrées à l'utilisateur courant.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: array
 *              items:
 *                type: object
 *                $ref: '#/definitions/application'
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
router.get('/list', isTokenValid, (req, res) =>
  applications_controller.list(req, res)
);

/**
 * @swagger
 * /application/stop:
 *  put:
 *    description: Stop an application.
 *    tags:
 *     - Application
 *    security:
 *     - Bearer: []
 *    produces:
 *     - application/json
 *    parameters:
 *     - name: id_application
 *       description: Application's id.
 *       in: query
 *       required: true
 *       type: integer
 *    responses:
 *      200:
 *        description: Application has been stopped.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/application'
 *      401:
 *        description: MissingArgumentError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/MissingArgumentError'
 *      403:
 *        description: UserIsNotOwner.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/UserIsNotOwner'
 *      500:
 *        description: DBConnexionRefused.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/DBConnexionRefused'
 */
router.put('/stop', isTokenValid, isOwner, (req, res) =>
  applications_controller.stop(req, res)
);

/**
 * @swagger
 * /application/start:
 *  put:
 *    description: Start an application.
 *    produces:
 *     - application/json *
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Application
 *    parameters:
 *     - name: id_application
 *       description: Application's id.
 *       in: query
 *       required: true
 *       type: integer
 *    responses:
 *      201:
 *        description: Application has been started.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/application'
 *      401:
 *        description: MissingArgumentError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/MissingArgumentError'
 *      403:
 *        description: UserIsNotOwner.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/UserIsNotOwner'
 *      500:
 *        description: DBConnexionRefused.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/DBConnexionRefused'
 */
router.put('/start', isTokenValid, isOwner, (req, res) =>
  applications_controller.start(req, res)
);

/**
 * @swagger
 * /application:
 *  post:
 *    tags:
 *     - Application
 *    description: Create a new application.
 *    produces:
 *     - application/json
 *    security:
 *     - Bearer: []
 *    parameters:
 *     - name: id_environment
 *       description: Environment's id.
 *       in: formData
 *       required: true
 *       type: integer
 *     - name: state_changed_date
 *       description: Date when the application will start.
 *       in: formData
 *       required: false
 *       type: date
 *     - name: label
 *       description: Custom label to name the application.
 *       in: formData
 *       required: false
 *       type: string
 *    responses:
 *      200:
 *        description: The application has been created / scheduled.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/application'
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
router.post('/', isTokenValid, isAdmin, (req, res) =>
  applications_controller.create(req, res)
);

/**
 * @swagger
 * /application:
 *  delete:
 *    tags:
 *     - Application
 *    description: Delete an application.
 *    produces:
 *     - application/json
 *    security:
 *     - Bearer: []
 *    parameters:
 *     - name: id_application
 *       description: Application's id.
 *       in: query
 *       required: true
 *       type: integer
 *    responses:
 *      200:
 *        description: Application has been deleted.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/application'
 *      401:
 *        description: MissingArgumentError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/MissingArgumentError'
 *      403:
 *        description: UserIsNotOwner.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/UserIsNotOwner'
 *      500:
 *        description: DBConnexionRefused.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/DBConnexionRefused'
 */
router.delete('/', isTokenValid, isAdmin, (req, res) =>
  applications_controller.deletion(req, res)
);

/**
 * @swagger
 * /application:
 *  get:
 *    tags:
 *     - Application
 *    description: Get all the application's infos.
 *    produces:
 *     - application/json
 *    security:
 *     - Bearer: []
 *    parameters:
 *     - name: id_application
 *       description: Application's id.
 *       in: query
 *       required: false
 *       type: integer
 *     - name: key
 *       description: Application's key. Is used before id_application when used in the same time.
 *       in: query
 *       required: false
 *       type: string
 *    responses:
 *      200:
 *        description: Application's infos.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/application'
 *      400:
 *        description: ParameterMisformed.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/ParameterMisformed'
 *      401:
 *        description: MissingArgumentError.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/MissingArgumentError'
 *      403:
 *        description: UserIsNotOwner.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/UserIsNotOwner'
 *      500:
 *        description: DBConnexionRefused.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/DBConnexionRefused'
 */
router.get('/', isTokenValid, isOwner, (req, res) =>
  applications_controller.get(req, res)
);

export default router;

/**
 * @swagger
 * definitions:
 *  application:
 *    properties:
 *      interfaces:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            label:
 *              type: string
 *            link:
 *              type: string
 *            service:
 *              type: string
 *      id_application:
 *        type: integer
 *      environment:
 *        type: string
 *      id_environment:
 *        type: integer
 *      custom_label:
 *        type: string
 *      icon:
 *        type: string
 *      generated_label:
 *        type: string
 *      username:
 *        type: string
 *      password:
 *        type: string
 *      hash:
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
 *  ParameterMisformed:
 *    properties:
 *      result:
 *        type: object
 *        properties:
 *          error:
 *            type: string
 *            example: "ParameterMisformed"
 *          message:
 *            type: string
 *            example: "The props.token parameter is misformed."
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
 *  UserIsNotOwner:
 *    properties:
 *      result:
 *        type: object
 *        properties:
 *          error:
 *            type: string
 *            example: "UserIsNotOwner"
 *          message:
 *            type: string
 *            example: "The user is not the owner of this application."
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
