import express from 'express';
import * as interface_controller from '../controllers/interface.controller.js';
import { isAdmin, isTokenValid } from '../utils/token.util.js';
const router = express.Router();

/**
 * @swagger
 * /interface:
 *  get:
 *    description: Gets an Interface based on its ID.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Interface
 *    produces:
 *     - application/json
 *    parameters:
 *    - name: id_interface
 *      description: The Interface's ID.
 *      in: query
 *      required : true
 *      type: string
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
router.get('/', isTokenValid, isAdmin, async (req, res) => {
  interface_controller.get(req, res);
});

/**
 * @swagger

 * /interface/list:
 *  get:
 *    description: Gets the list of Interfaces.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Interface
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
  interface_controller.list(req, res);
});
/**
 * @swagger

 * /interface/:
 *  post:
 *    description: Adds a new Interface into the database.
 *    security:
 *     - Bearer: []
 *    tags:
 *    - Interface
 *    produces:
 *    - application/json
 *    parameters:
 *    - name: label
 *      description: The new Interface's label.
 *      in: formData
 *      required: true
 *      type: string
 *    - name: registry_link
 *      description: The new Interface's registry link.
 *      in: formData
 *      required: true
 *      type: string
 *    - name: exec_command
 *      description: The new Interface's exec_command.
 *      in: formData
 *      required: true
 *      type: string
 *    - name: service_command
 *      description: The new Interface's service_command.
 *      in: formData
 *      required: true
 *      type: string
 *    - name: privileged
 *      description: The new Interface's privileged.
 *      in: formData
 *      required: true
 *      type: boolean
 *    - name: id_type
 *      description: The new Interface's type's ID.
 *      in: formData
 *      required: true
 *      type: integer
 *    - name: cpu_request
 *      description: The Interface's cpu_request.
 *      in: formData
 *      required: true
 *      type: integer
 *    - name: cpu_limit
 *      description: The Interface's cpu_limit.
 *      in: formData
 *      required: true
 *      type: integer
 *    - name: ram_request
 *      description: The Interface's ram_request.
 *      in: formData
 *      required: true
 *      type: string
 *    - name: ram_limit
 *      description: The Interface's ram_limit.
 *      in: formData
 *      required: true
 *      type: string
 *    - name: need_compute_gpu
 *      description: The Interface's need_compute_gpu.
 *      in: formData
 *      required: true
 *      type: boolean
 *    - name: need_graphical_rendering_gpu
 *      description: The Interface's need_graphical_rendering_gpu.
 *      in: formData
 *      required: true
 *      type: boolean
 *    - name: egress_bandwidth
 *      description: The Interface's egress_bandwidth.
 *      in: formData
 *      required: true
 *      type: string
 *    - name: ingress_bandwidth
 *      description: The Interface's ingress_bandwidth.
 *      in: formData
 *      required: true
 *      type: string
 *    - name: readiness_probe_initial_delay
 *      description: The Interface's readiness_probe_initial_delay.
 *      in: formData
 *      required: true
 *      type: integer
 *    - name: readiness_probe_period
 *      description: The Interface's readiness_probe_period.
 *      in: formData
 *      required: true
 *      type: integer
 *    - name: liveness_probe_initial_delay
 *      description: The Interface's liveness_probe_initial_delay.
 *      in: formData
 *      required: true
 *      type: integer
 *    - name: liveness_probe_period
 *      description: The Interface's liveness_probe_period.
 *      in: formData
 *      required: true
 *      type: integer
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
 *           $ref: '#/definitions/DBObjectNotFoundInterface'
 *       500:
 *         description: DBConnexionRefused
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBConnexionRefused'
 */
router.post('/', isTokenValid, isAdmin, (req, res) => {
  interface_controller.create(req, res);
});
/**
 * @swagger

 * /interface/{id_interface}:
 *  put:
 *    description: Changes an Interface with different parameters based on its ID.
 *    security:
 *     - Bearer: []
 *    tags:
 *     - Interface
 *    produces:
 *     - application/json
 *    parameters:
 *     - name: id_interface
 *       description: Numeric ID of the Interface to get.
 *       in: path
 *       required : true
 *       type: integer
 *     - name: exec_command
 *       description: The Interface's new exec_command.
 *       in: formData
 *       type: string
 *     - name: service_command
 *       description: The Interface's new service_command.
 *       in: formData
 *       type: string
 *     - name: cpu_request
 *       description: The Interface's cpu_request.
 *       in: formData
 *       type: integer
 *     - name: cpu_limit
 *       description: The Interface's new cpu_limit.
 *       in: formData
 *       type: integer
 *     - name: ram_request
 *       description: The Interface's ram_request.
 *       in: formData
 *       type: string
 *     - name: ram_limit
 *       description: The Interface's new ram_limit.
 *       in: formData
 *       type: string
 *     - name: need_compute_gpu
 *       description: The Interface's new need_compute_gpu.
 *       in: formData
 *       type: boolean
 *     - name: need_graphical_rendering_gpu
 *       description: The Interface's new need_graphical_rendering_gpu.
 *       in: formData
 *       required : false
 *       type: boolean
 *     - name: label
 *       description: The Interface's new label.
 *       in: formData
 *       required : false
 *       type: string
 *     - name: registry_link
 *       description: The Interface's new registry_link.
 *       in: formData
 *       required : false
 *       type: string
 *     - name: id_type
 *       description: The Interface's new id_type.
 *       in: formData
 *       required : false
 *       type: integger
 *     - name: egress_bandwidth
 *       description: The Interface's new egress_bandwidth.
 *       in: formData
 *       required : false
 *       type: string
 *     - name: ingress_bandwidth
 *       description: The Interface's new ingress_bandwidth.
 *       in: formData
 *       required : false
 *       type: string
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
 *           $ref: '#/definitions/DBObjectNotFoundEnvironment'
 *       500:
 *         description: DBConnexionRefused
 *         schema:
 *           type: object
 *           $ref: '#/definitions/DBConnexionRefused'
 */
router.put('/:id_interface', isTokenValid, isAdmin, (req, res) => {
  interface_controller.update(req, res);
});

export default router;

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
