import { counter, counter_post } from '../middlewares/prometheus.js';
import { ApiResponse } from '../utils/response.util.js';
import * as agent_service from '../services/agents.service.js';
import Guard from '../utils/guard.util.js';
import logs from '../middlewares/winston.js';
import z from 'zod';

/**
 * Controller that checks the request before creating a new environment.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const create = async function (
  req,
  res,
  fns = {
    create: agent_service.create,
  }
) {
  try {
    counter_post.inc();
    counter.inc();
    const schema = z.object({
      label: z.string().min(2),
      type: z.string().min(2),
    });
    const data = Guard.validateProps(schema, req.body);
    return await fns
      .create(data)
      .then((env) =>
        ApiResponse.success(req, res, env.toJSON(), 200, 'New agent added.')
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};
