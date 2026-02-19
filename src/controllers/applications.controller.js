import moment from 'moment-timezone';
import * as applications_service from '../services/applications.service.js';
import * as token from '../utils/token.util.js';
import {
  counter_delete,
  counter_get,
  counter,
  counter_put,
  counter_post,
} from '../middlewares/prometheus.js';
import CONFIG from '../config/config.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.util.js';
import { ApiResponse } from '../utils/response.util.js';
import Guard from '../utils/guard.util.js';
import logs from '../middlewares/winston.js';

/**
 * Controllers that checks parameters and return the list of all applications in public format.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const list = async (
  req,
  res,
  fns = {
    applications_list: applications_service.list,
  }
) => {
  const id_user = token.getUserId({ token: req.headers['authorization'] });
  await fns
    .applications_list({ id_user })
    .then((applications) =>
      ApiResponse.success(
        req,
        res,
        applications.map((app) => app.public_format()),
        200,
        'List of applications transmitted.'
      )
    )
    .catch((err) => {
      logs.debug(err);
      ApiResponse.error(req, res, err);
    });
};

/**
 * Controller that checks parameters and return application's informations.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const get = async (
  req,
  res,
  fns = {
    application_get: applications_service.get,
  }
) => {
  try {
    // Prometheus
    counter_get.inc();
    counter.inc();

    //Request
    if (
      !Object.keys(req.query).includes('id_application') &&
      !Object.keys(req.query).includes('key')
    )
      throw new MissingArgumentError(
        'The query parameter (id_application,key) is missing.'
      );
    const options = {};
    if (req.query.id_application)
      options.id_application = req.query.id_application;
    if (req.query.key) options.key = req.query.key;
    await fns
      .application_get(options)
      .then((app) =>
        ApiResponse.success(
          req,
          res,
          app.public_format(),
          200,
          'Application information transmitted.'
        )
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks parameters and start the application.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const start = async (
  req,
  res,
  fns = {
    application_start: applications_service.update_state,
  }
) => {
  // Prometheus
  counter_put.inc();
  counter.inc();

  //Request
  try {
    Guard.check_query(req, ['id_application']);
    await fns
      .application_start({
        id_application: req.query.id_application,
        state_application: 'Ready',
      })
      .then((application) =>
        ApiResponse.success(
          req,
          res,
          application.public_format(),
          200,
          'Application started.'
        )
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks parameters and stop the application.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const stop = async (
  req,
  res,
  fns = {
    application_stop: applications_service.update_state,
  }
) => {
  // Prometheus
  counter_put.inc();
  counter.inc();

  //Request
  await fns
    .application_stop({
      id_application: req.query.id_application,
      state_application: 'Off',
    })
    .then((application) =>
      ApiResponse.success(
        req,
        res,
        application.public_format(),
        200,
        'Application stopped.'
      )
    )
    .catch((err) => {
      logs.debug(err);
      ApiResponse.error(req, res, err);
    });
};

/**
 * Controller that checks parameters and delete an application.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const deletion = async (
  req,
  res,
  fns = {
    application_delete: applications_service.deletion,
  }
) => {
  // Prometheus
  counter_delete.inc();
  counter.inc();

  //Request
  try {
    Guard.check_query(req, ['id_application']);

    // Validate backup_storage parameter
    if (req.body.backup_storage !== undefined) {
      const backupStorage = req.body.backup_storage.toString().toLowerCase();
      if (backupStorage !== 'true' && backupStorage !== 'false') {
        throw new ParameterMisformed(
          'backup_storage must be a boolean string ("true" or "false").'
        );
      }
      req.body.backup_storage = backupStorage === 'true';
    }

    await fns
      .application_delete({
        id_application: req.query.id_application,
        backup_storage: req.body.backup_storage ?? true,
      })
      .then((application) =>
        ApiResponse.success(
          req,
          res,
          application.public_format(),
          200,
          'Application stopped and deleted.'
        )
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks parameters and create an application.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const create = async (
  req,
  res,
  fns = {
    application_create: applications_service.create,
  }
) => {
  // Prometheus
  counter_post.inc();
  counter.inc();

  //Request
  try {
    Guard.check_body(req, ['id_environment', 'id_datacenter']);
    const id_user = token.getUserId({ token: req.headers['authorization'] });
    const response = await fns.application_create({
      id_user,
      id_datacenter: req.body.id_datacenter,
      id_environment: req.body.id_environment,
      label: req.body.label === undefined ? '' : req.body.label,
      state_changed_date:
        req.body.state_changed_date === undefined
          ? moment.tz(CONFIG.APP_TZ)
          : moment(req.body.state_changed_date).tz(CONFIG.APP_TZ),
    });
    ApiResponse.success(
      req,
      res,
      response.public_format(),
      200,
      'Application created.'
    );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};
