import * as auth_service from '../services/auth.service.js';
import { counter, counter_post } from '../middlewares/prometheus.js';
import { ApiResponse } from '../utils/response.util.js';
import Guard from '../utils/guard.util.js';

/**
 * Controller that checks parameters and should execute the connexion.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
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
    Guard.check_body(req, ['mail', 'password']);
    await fns
      .auth_connect({ mail: req.body.mail, password: req.body.password })
      .then((token) =>
        ApiResponse.success(
          req,
          res,
          { token },
          200,
          'Authentication successful'
        )
      );
  } catch (err) {
    ApiResponse.error(req, res, err);
  }
};
