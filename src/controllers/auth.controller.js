import * as auth_service from '../services/auth.service.js';
import * as parametres from '../utils/parametres.service.js';
import { counter, counter_post } from '../middlewares/prometheus.js';
import { ApiResponse } from '../utils/response.util.js';

/**
 * Controller that checks parameters and should execute the connexion.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const connect = async (
  req,
  res,
  fns = {
    auth_connect: auth_service.connect,
  }
) => {
  // Prometheus
  counter_post.inc();
  counter.inc();

  //Request
  // Vérification du contenu de la requête
  try {
    parametres.check_body(req, ['mail', 'password']);
    await fns.auth_connect({ mail: req.body.mail, password: req.body.password })
    .then(token => ApiResponse.success(req, res, { token }, 200, 'Authentication successful'))
  } catch (err) {
    ApiResponse.error(req,res,err);
  }
};
