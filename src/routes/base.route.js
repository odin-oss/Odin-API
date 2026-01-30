import express from 'express';
import moment from 'moment-timezone';
import fs from 'fs';
import {
  health_client,
  counter,
  counter_get,
} from '../utils/health.service.js';
import CONFIG from '../config/config.js';

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
router.get('/', function (req, res, next) {
  counter.inc();
  counter_get.inc();
  res.send({
    result: {
      timezone: CONFIG.timezone,
      date: moment.tz(CONFIG.timezone).format(),
      message: 'Odin (by Caelus) is working well.',
      version: JSON.parse(fs.readFileSync('package.json', 'utf8')).version,
    },
  });
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
router.get('/metrics', async function (req, res, next) {
  res.set('Content-Type', health_client.register.contentType);
  const result = health_client.register.metrics();
  return await Promise.resolve(result).then((r) => {
    res.end(r);
  });
});

export default router;
