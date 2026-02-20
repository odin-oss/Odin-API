import logs from '../middlewares/winston.js';
import * as variableEnvironment_service from '../services/variableEnvironment.service.js';
import { ApiResponse } from '../utils/response.util.js';

/**
 * Controller that checks the request before listing the varenvs
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const list = async function (
    req,
    res,
    fns = {
        variableEnvironment_list: variableEnvironment_service.list,
    }
) {
    return await fns.variableEnvironment_list()
        .then((response) => ApiResponse.success(req, res, response.map((varEnvs) => varEnvs.toJSON()), 200, 'List of variables environments type transmitted.'))
        .catch((error) => {
            logs.debug(error);
            ApiResponse.error(req, res, error);
        });
};
