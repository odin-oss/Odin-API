import * as user_service from '../services/user.service.js';
import { counter_get, counter } from '../middlewares/prometheus.js';
import * as token from '../utils/token.util.js';
import { ParameterMisformed } from '../utils/errors.util.js';
import { ApiResponse } from '../utils/response.util.js';
import Guard from '../utils/guard.util.js';
import z from 'zod';

/**
 * Controller that checks parameters and return current user's informations.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting service function for tests.
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
  try {
    const id_user = token.getUserId({ token: req.headers['authorization'] });
    await fns
      .user_get({ id_user })
      .then((user) =>
        ApiResponse.success(
          req,
          res,
          user.public_format(),
          200,
          'Informations transmitted.'
        )
      );
  } catch (err) {
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks parameters and changes user's password.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting service function for tests.
 */
export const update_password = async function (
  req,
  res,
  fns = {
    user_update_password: user_service.update_password,
  }
) {
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request
  try {
    Guard.check_body(req, ['old_password', 'password']);
    const id_user = token.getUserId({ token: req.headers['authorization'] });
    await fns
      .user_update_password({
        id_user,
        old_password: req.body.old_password,
        password: req.body.password,
      })
      .then(() => ApiResponse.success(req, res, {}, 200, 'Password changed.'));
  } catch (err) {
    ApiResponse.error(req, res, err);
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
    Guard.check_query(req, ['user_role']);
    const schema = z.object({
      user_role: z.enum(['ETUDIANT', 'PROFESSEUR', 'ADMINISTRATEUR']),
    });
    const data = Guard.validateProps(schema, req.query);
    await fns
      .user_list(data)
      .then((users) =>
        ApiResponse.success(
          req,
          res,
          { users: users.map((user) => user.public_format()) },
          200,
          'List of users transmitted.'
        )
      );
  } catch (err) {
    ApiResponse.error(req, res, err);
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
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request

  try {
    Guard.check_body(req, [
      'password',
      'mail',
      'lastname',
      'firstname',
      'role',
    ]);
    if (!['PROFESSEUR', 'ETUDIANT'].includes(req.body.role))
      throw new ParameterMisformed('The req.body.role parameter is misformed.');
    await fns
      .create({
        mail: req.body.mail,
        pwd: req.body.password,
        role: req.body.role,
        lastname: req.body.lastname,
        firstname: req.body.firstname,
      })
      .then((u) =>
        ApiResponse.success(req, res, u.public_format(), 201, 'User created.')
      );
  } catch (err) {
    ApiResponse.error(req, res, err);
  }
};
