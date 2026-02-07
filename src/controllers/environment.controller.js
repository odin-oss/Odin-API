import logs from '../middlewares/winston.js';
import * as environment_service from '../services/environment.service.js';
import { counter_get, counter } from '../middlewares/prometheus.js';

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
  return await Promise.resolve(fns.environment_list())
    .then((environments) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : List of environments transmitted.`
      );
      return res
        .status(200)
        .json({ result: environments.map((env) => env.public_format()) });
    })
    .catch((err) => {
      logs.error(
        `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}`
      );
      return res.status(err.code).json({
        result: {
          error: err.name,
          message: err.message,
        },
      });
    });
};
