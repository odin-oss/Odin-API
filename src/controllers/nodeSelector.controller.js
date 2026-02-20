import * as nodeSelector_service from '../services/nodeSelector.service.js';
import { ApiResponse } from '../utils/response.util.js';
import logs from '../middlewares/winston.js';

/**
 * Controller that checks the request before getting the list of all node_selector.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const list = async function (
  req,
  res,
  fns = {
    list: nodeSelector_service.list,
  }
) {
  await fns
    .list()
    .then((response) =>
      ApiResponse.success(
        req,
        res,
        response.map((ns) => ns.toJSON()),
        200,
        'List of nodes selectors transmitted.'
      )
    )
    .catch((error) => {
      logs.debug(error);
      ApiResponse.error(req, res, error);
    });
};
