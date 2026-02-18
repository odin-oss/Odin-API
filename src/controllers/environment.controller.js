import * as environment_service from '../services/environment.service.js';
import { counter_get, counter } from '../middlewares/prometheus.js';
import { ApiResponse } from '../utils/response.util.js';

/**
 * Controller that checks parameters and return the list of environments.
 * @param {*} req HTTP request.
 * @param {*} res HTTP request.
 * @param {*} fns overwriting functions for tests.
 * @returns
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
    .catch((err) => ApiResponse.error(req, res, err));
};
