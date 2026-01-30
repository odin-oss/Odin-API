import express from 'express';
import * as session_controller from '../controllers/sessions.controller.js';
import {
  isTokenValid,
  isAdmin,
  isProfOrAdmin,
} from '../utils/token.service.js';

const router = express.Router();

/**
 * @swagger
 * /session:
 *  post:
 *    tags:
 *     - Session
 *    description: Create a new session.
 *    produces:
 *     - application/json
 *    security:
 *     - Bearer: []
 *    parameters:
 *     - name: label_session
 *       description: Label of the session (seen by professor and admin).
 *       in: formData
 *       required: true
 *       type: string
 *     - name: label_application
 *       description: Label of the application in the session (seen by all users and admins).
 *       in: formData
 *       required: true
 *       type: string
 *     - name: begin_date
 *       description: Begin date of schuduled application.
 *       in: formData
 *       required: true
 *       type: date
 *     - name: end_date
 *       description: End date of schuduled application.
 *       in: formData
 *       required: true
 *       type: date
 *     - name: id_environment
 *       description: Id of the corresponding environment.
 *       in: formData
 *       required: true
 *       type: integer
 *     - name: users
 *       description: Array of ids of users (those who will have an application running).
 *       in: formData
 *       required: true
 *       type: array
 *     - name: professors
 *       description: Array of ids of users (those who will have the session to manage).
 *       in: formData
 *       required: true
 *       type: date
 *     - name: id_datacenter
 *       description: Id of the corresponding datacenter.
 *       in: formData
 *       required: true
 *       type: integer
 *    responses:
 *      200:
 *        description: The session has been scheduled.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: object
 *              $ref: '#/definitions/session'
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
  session_controller.create(req, res)
);

/**
 * @swagger
 * /session/list:
 *  get:
 *    tags:
 *     - Session
 *    description: List the session the user can get - attributed for PROFESSOR and all the sessions for admin.
 *    produces:
 *     - application/json
 *    security:
 *     - Bearer: []
 *    responses:
 *      200:
 *        description: The session has been scheduled.
 *        schema:
 *          type: object
 *          properties:
 *            result:
 *              type: array
 *              items:
 *                type: object
 *                $ref: '#/definitions/session'
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
router.get('/list', isTokenValid, isProfOrAdmin, (req, res) =>
  session_controller.list(req, res)
);

/**
 * @swagger
 * /session/:
 *  get:
 *    tags:
 *     - Session
 *    description: Get specific session informations.
 *    produces:
 *     - application/json
 *    security:
 *     - Bearer: []
 *    responses:
 *      200:
 *        description: The session informations.
 *        schema:
 *          type: object
 *          $ref: '#/definitions/session'
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
router.get('/', isTokenValid, isProfOrAdmin, (req, res) =>
  session_controller.get(req, res)
);

export default router;

/**
 * @swagger
 * definitions:
 *  session:
 *    properties:
 *      id_session:
 *        type: integer
 *      label:
 *        type: string
 *      begin_date:
 *        type: datetime
 *      end_date:
 *        type: datetime
 *      users:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            id_user:
 *              type: integer
 *            lastname:
 *              type: string
 *            firstname:
 *              type: string
 *            mail:
 *              type: string
 *            role:
 *              type: string
 *      professors:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            id_user:
 *              type: integer
 *            lastname:
 *              type: string
 *            firstname:
 *              type: string
 *            mail:
 *              type: string
 *            role:
 *              type: string
 *      datacenter:
 *        type: object
 *        properties:
 *          id_datacenter:
 *            type: integer
 *          label:
 *            type: string
 *          provider:
 *            type: string
 *          city:
 *            type: string
 *      applications:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            interfaces:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  label:
 *                    type: string
 *                  link:
 *                    type: string
 *                  service:
 *                    type: string
 *            id_application:
 *              type: integer
 *            environment:
 *              type: string
 *            id_environment:
 *              type: integer
 *            custom_label:
 *              type: string
 *            icon:
 *              type: string
 *            generated_label:
 *              type: string
 *            username:
 *              type: string
 *            password:
 *              type: string
 *            hash:
 *              type: string
 *      environment:
 *        type: object
 *        properties:
 *          id_environment:
 *            type: integer
 *          label:
 *            type: string
 *          icon:
 *            type: string
 *          interfaces:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                id_interface:
 *                  type: integer
 *                label:
 *                  type: string
 *                label_type_image:
 *                  type: string
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
