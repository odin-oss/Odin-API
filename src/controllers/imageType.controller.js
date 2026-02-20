import * as imageType_service from '../services/imageType.service.js';
import { ApiResponse } from '../utils/response.util.js';
import logs from '../middlewares/winston.js';

/**
 * Controller that checks the request before getting the list of image_types.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const list = async function (
  req,
  res,
  fns = {
    list: imageType_service.list,
  }
) {
  try {
    await fns.list().then((its) =>
      ApiResponse.success(
        req,
        res,
        its.map((it) => it.toJSON()),
        200,
        'List of images type transmitted.'
      )
    );
  } catch (error) {
    logs.debug(error);
    ApiResponse.error(req, res, error);
  }
};
