import express from 'express';
import fs from 'fs';
import {
  health_client,
  counter,
  counter_get,
} from '../middlewares/prometheus.js';
import CONFIG from '../config/config.js';
import { ApiResponse } from '../utils/response.util.js';

const router = express.Router();
/**
 * @swagger
 * definitions:
 *   base:
 *     properties:
 *       result:
 *         type: object
 *         properties:
 *           timezone:
 *             type: string
 *           date:
 *             type: string
 *           message:
 *             type: string
 *           version:
 *             type: string
 */

/**
 * @swagger
 * /:
 *  get:
 *    tags:
 *     - Base
 *    description: Base route to test if Odin is working.
 *    produces:
 *     - application/json
 *    responses:
 *       200:
 *         description: Testing Odin.
 *         schema:
 *           type: object
 *           $ref: '#/definitions/base'
 */
router.get('/', function (req, res) {
  counter.inc();
  counter_get.inc();
  ApiResponse.success(
    req,
    res,
    {
      result: {
        timezone: CONFIG.APP_TZ,
        message: 'Odin (by Caelus) is working well.',
        version: JSON.parse(fs.readFileSync('package.json', 'utf8')).version,
      },
    },
    200,
    'Odin (by Caelus) is working well.'
  );
});

/**
 * @swagger
 * /metrics:
 *  get:
 *    tags:
 *     - Base
 *    description: Application's metrics for Prometheus.
 *    produces:
 *     - text/plain
 *    responses:
 *       200:
 *         description: Application's metrics for Prometheus.
 */
router.get('/metrics', async function (req, res) {
  res.set('Content-Type', health_client.register.contentType);
  return await health_client.register.metrics().then((r) => res.end(r));
});

export default router;
