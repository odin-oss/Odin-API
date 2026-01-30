import logs from '../config/winston.config.js';
import * as auth_service from '../services/auth.service.js';
import * as parametres from '../utils/parametres.service.js';
import CONFIG from '../config/config.js';
import * as issuer from 'openid-client';
import { counter, counter_post, counter_get } from '../utils/health.service.js';

/**
 * Controller that give you general connexion configurations.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @returns
 */
export const login_options = async (req, res) => {
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request
  const options = [];
  if (CONFIG.credentials_enabled) options.push('credentials');
  if (CONFIG.oidc_enabled) options.push('OIDC');
  return res.status(200).json({
    result: options,
  });
};

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
    return await Promise.resolve(
      fns.auth_connect({ mail: req.body.mail, password: req.body.password })
    ).then((token) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : Connexion achieved.`
      );
      return res.status(200).json({ result: token });
    });
  } catch (err) {
    logs.error(
      `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}`
    );
    return res.status(err.code).json({
      result: {
        error: err.name,
        message: err.message,
      },
    });
  }
};
