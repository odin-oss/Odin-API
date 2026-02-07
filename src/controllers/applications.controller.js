import logs from '../middlewares/winston.js';
import moment from 'moment-timezone';
import * as applications_service from '../services/applications.service.js';
import * as token from '../utils/token.service.js';
import * as parametres from '../utils/parametres.service.js';
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
} from '../utils/errors.service.js';
import UniformResponse from '../objects/UniformResponse.js';

/**
 * Controllers that checks parameters and return the list of all applications in public format.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
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
    .then((applications) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : List of applications transmitted.`
      );
      return res
        .status(200)
        .json({ result: applications.map((app) => app.public_format()) });
    })
    .catch((err) => {
      logs.error(
        `[${req.method}][${err.code}][${err.name}] ${req.originalUrl} : ${err.message}`
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
 * Controller that checks parameters and return application's informations.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
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
    return await Promise.resolve(fns.application_get(options)).then((app) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : Application transmitted.`
      );
      return res.status(200).json({ result: app.public_format() });
    });
  } catch (err) {
    logs.error(
      `[${req.method}][${err.code}]{${err.name}} ${req.originalUrl} : ${err.message}`
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
 * Controller that checks parameters and start the application.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting function for tests.
 * @returns
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
    parametres.check_query(req, ['id_application']);
    return await Promise.resolve(
      fns.application_start({
        id_application: req.query.id_application,
        state_application: 'Ready',
      })
    ).then((application) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : Application started.`
      );
      return res.status(200).json({ result: application.public_format() });
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

/**
 * Controller that checks parameters and stop the application.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
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
  try {
    return await Promise.resolve(
      fns.application_stop({
        id_application: req.query.id_application,
        state_application: 'Off',
      })
    ).then((application) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : Application stopped.`
      );
      return res.status(200).json({ result: application.public_format() });
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

/**
 * Controller that checks parameters and delete an application.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
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
    parametres.check_query(req, ['id_application']);

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

    return await Promise.resolve(
      fns.application_delete({
        id_application: req.query.id_application,
        backup_storage: req.body.backup_storage ?? true,
      })
    ).then((application) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : Application stopped and deleted.`
      );
      return res.status(200).json({ result: application.public_format() });
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

/**
 * Controller that checks parameters and create an application.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
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
    parametres.check_body(req, ['id_environment', 'id_datacenter']);
    const id_user = token.getUserId({ token: req.headers['authorization'] });
    return await Promise.resolve(
      fns.application_create({
        id_user,
        id_datacenter: req.body.id_datacenter,
        id_environment: req.body.id_environment,
        label: req.body.label === undefined ? '' : req.body.label,
        state_changed_date:
          req.body.state_changed_date === undefined
            ? moment.tz(CONFIG.timezone)
            : moment(req.body.state_changed_date).tz(CONFIG.timezone),
      })
    ).then((application) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : Application started.`
      );
      return res.status(200).json({
        result: application.public_format(),
      });
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
