import * as argument_service from '../services/argument.service.js';
import { ApiResponse } from '../utils/response.util.js';
import logs from '../middlewares/winston.js';

/**
 * Controller that checks the request before getting the list of all arguments.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const list = async function (
  req,
  res,
  fns = {
    list: argument_service.list,
  }
) {
  return await fns
    .list()
    .then((response) =>
      ApiResponse.success(
        req,
        res,
        response.map((args) => args.toJSON()),
        200,
        'List of arguments transmitted'
      )
    )
    .catch((error) => {
      logs.debug(error);
      ApiResponse.error(req, res, error);
    });
};
