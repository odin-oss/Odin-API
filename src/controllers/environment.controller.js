import * as environment_service from '../services/environment.service.js';
import { counter_get, counter } from '../middlewares/prometheus.js';
import { ApiResponse } from '../utils/response.util.js';
import logs from '../middlewares/winston.js';

/**
 * Controller that checks parameters and return the list of environments.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const list = async function (
  req,
  res,
  fns = {
    environment_list: environment_service.list,
  }
) {
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request
  await fns
    .environment_list()
    .then((environments) =>
      ApiResponse.success(
        req,
        res,
        environments.map((env) => env.public_format()),
        200,
        'List of environments transmitted.'
      )
    )
    .catch((err) => {
      logs.debug(err);
      ApiResponse.error(req, res, err);
    });
};
