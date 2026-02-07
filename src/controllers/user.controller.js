import logs from '../middlewares/winston.js';
import * as user_service from '../services/user.service.js';
import { counter_get, counter } from '../middlewares/prometheus.js';
import * as token from '../utils/token.service.js';
import * as parametres from '../utils/parametres.service.js';
import { ParameterMisformed } from '../utils/errors.service.js';

/**
 * Controller that checks parameters and return current user's informations.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting service function for tests.
 * @returns
 */
export const me = async function (
  req,
  res,
  fns = {
    user_get: user_service.get,
  }
) {
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request
  const id_user = token.getUserId({ token: req.headers['authorization'] });
  return await Promise.resolve(fns.user_get({ id_user }))
    .then((user) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : Informations transmitted.`
      );
      return res.status(200).json({ result: user.public_format() });
    })
    .catch((err) => {
      logs.error(
        `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}.`
      );
      return res.status(err.code).json({
        result: {
          error: err.name,
          message: err.message,
        },
      });
    });
};

/**
 * Controller that checks parameters and changes user's password.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting service function for tests.
 * @returns
 */
export const update_password = async function (
  req,
  res,
  fns = {
    user_update_password: user_service.update_password,
  }
) {
  try {
    // Prometheus
    counter_get.inc();
    counter.inc();

    //Request
    parametres.check_body(req, ['old_password', 'password']);
    const id_user = token.getUserId({ token: req.headers['authorization'] });
    return await Promise.resolve(
      fns.user_update_password({
        id_user,
        old_password: req.body.old_password,
        password: req.body.password,
      })
    ).then((user) => {
      logs.info(`[${req.method}][200] ${req.originalUrl} : Password changed.`);
      return res.status(200).json({ result: user.public_format() });
    });
  } catch (err) {
    logs.error(
      `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}.`
    );
    return res.status(err.code).json({
      result: {
        error: err.name,
        message: err.message,
      },
    });
  }
};

/**
 * Controller that checks parameters and return list of users informations filtered by role.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting service function for tests.
 * @returns
 */
export const list = async function (
  req,
  res,
  fns = {
    user_list: user_service.list_by_role,
  }
) {
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request
  try {
    parametres.check_query(req, ['user_role']);
    if (!parametres.check_user_role(req.query.user_role))
      throw new ParameterMisformed(
        'The req.query.user_role parameter is misformed.'
      );
    return await Promise.resolve(
      fns.user_list({ user_role: req.query.user_role })
    ).then((users) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : List of users transmitted.`
      );
      return res
        .status(200)
        .json({ result: users.map((user) => user.public_format()) });
    });
  } catch (err) {
    logs.error(
      `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}.`
    );
    return res.status(err.code).json({
      result: {
        error: err.name,
        message: err.message,
      },
    });
  }
};

/**
 * Controller that checks request before launching creation of demo account. ONLY FOR DEMOS
 * @param {*} req
 * @param {*} req
 * @returns
 */
export const create = async function (
  req,
  res,
  fns = {
    create: user_service.create,
  }
) {
  try {
    // Prometheus
    counter_get.inc();
    counter.inc();

    //Request
    parametres.check_body(req, [
      'password',
      'mail',
      'lastname',
      'firstname',
      'role',
    ]);
    if (!['PROFESSEUR', 'ETUDIANT'].includes(req.body.role))
      throw new ParameterMisformed('The req.body.role parameter is misformed.');
    return await Promise.resolve(
      fns.create({
        mail: req.body.mail,
        pwd: req.body.password,
        role: req.body.role,
        lastname: req.body.lastname,
        firstname: req.body.firstname,
      })
    ).then((u) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : Nouvel utilisateur créé.`
      );
      return res.status(200).json({ result: u.toJSON() });
    });
  } catch (err) {
    logs.error(
      `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}.`
    );
    return res.status(err.code).json({
      result: {
        error: err.name,
        message: err.message,
      },
    });
  }
};
