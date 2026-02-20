import * as portType_service from '../services/portType.service.js';
import { ApiResponse } from '../utils/response.util.js';
import logs from '../middlewares/winston.js';

/**
 * Controller that checks the request before listing all the port_types.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const list = async function (
    req,
    res,
    fns = {
        list: portType_service.list,
    }
) {
    await fns.list()
        .then((response) => ApiResponse.success(req, res, response.map((pt) => pt.toJSON()), 200, 'List of port Type type transmitted.'))
        .catch((error) => {
            logs.debug(error);
            ApiResponse.error(req, res, error);
        });
};
