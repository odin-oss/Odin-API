import * as category_service from '../services/category.service.js';
import { counter_get, counter } from '../middlewares/prometheus.js';
import { ApiResponse } from '../utils/response.util.js';

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
  await fns.category_list()
    .then(categories => ApiResponse.success(req, res, categories.map((category) => category.public_format()), 200, 'List of categories transmitted.'))
    .catch(err => ApiResponse.error(req, res, err));
};
