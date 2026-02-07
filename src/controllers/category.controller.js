import logs from '../middlewares/winston.js';
import * as category_service from '../services/category.service.js';
import { counter_get, counter } from '../middlewares/prometheus.js';

/**
 * Controller that checks parameters and return the list of categories.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const list = async function (
  req,
  res,
  fns = {
    category_list: category_service.list,
  }
) {
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request
  return await Promise.resolve(fns.category_list())
    .then((categories) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : List of categories transmitted.`
      );
      return res.status(200).json({
        result: categories.map((category) => category.public_format()),
      });
    })
    .catch((err) => {
      logs.error(
        `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.result}.`
      );
      return res.status(err.code).json({
        result: {
          error: err.name,
          message: err.message,
        },
      });
    });
};
