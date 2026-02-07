import logs from '../middlewares/winston.js';
import * as session_service from '../services/session.service.js';
import * as parametres from '../utils/parametres.service.js';
import {
  counter,
  counter_get,
  counter_post,
} from '../middlewares/prometheus.js';
import { ParameterMisformed } from '../utils/errors.service.js';
import * as token from '../utils/token.service.js';
/**
 * Controller that checks parameters and create a new session.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const create = async (
  req,
  res,
  fns = {
    session_create: session_service.create,
  }
) => {
  // Prometheus
  counter_post.inc();
  counter.inc();

  //Request
  try {
    parametres.check_body(req, [
      'label_session',
      'label_application',
      'id_environment',
      'id_datacenter',
      'begin_date',
      'end_date',
      'professors',
      'users',
    ]);

    if (!parametres.check_id(req.body.id_environment))
      throw new ParameterMisformed(
        'The req.body.id_environment parameter is misformed.'
      );
    if (!parametres.check_id(req.body.id_datacenter))
      throw new ParameterMisformed(
        'The req.body.id_datacenter parameter is misformed.'
      );

    if (!parametres.check_ids(JSON.parse(req.body.professors)))
      throw new ParameterMisformed(
        'The req.body.professors parameter is misformed.'
      );
    if (!parametres.check_ids(JSON.parse(req.body.users)))
      throw new ParameterMisformed(
        'The req.body.users parameter is misformed.'
      );
    if (!parametres.check_date(req.body.begin_date))
      throw new ParameterMisformed(
        'The req.body.begin_date parameter is misformed.'
      );
    if (!parametres.check_date(req.body.end_date))
      throw new ParameterMisformed(
        'The req.body.end_date parameter is misformed.'
      );
    if (typeof req.body.label_session !== 'string')
      throw new ParameterMisformed(
        'The req.body.label_session parameter is misformed.'
      );
    if (typeof req.body.label_application !== 'string')
      throw new ParameterMisformed(
        'The req.body.label_application parameter is misformed.'
      );

    return await Promise.resolve(
      fns.session_create({
        label_session: req.body.label_session,
        label_application: req.body.label_application,
        begin_date: req.body.begin_date,
        end_date: req.body.end_date,
        id_environment: req.body.id_environment,
        id_datacenter: req.body.id_datacenter,
        users: JSON.parse(req.body.users),
        professors: JSON.parse(req.body.professors),
      })
    ).then((session) => {
      logs.info(`[${req.method}][200] ${req.originalUrl} : Session started.`);
      return res.status(200).json({
        result: session.public_format(),
      });
    });
  } catch (err) {
    const code = err.name === 'SyntaxError' ? 400 : err.code;
    logs.error(
      `[${req.method}][${code}][${err.name}] ${req.originalUrl} : ${err.message}`
    );
    return res.status(code).json({
      result: {
        error: err.name,
        message: err.message,
      },
    });
  }
};

/**
 * Controller that checks parameters and fetch the list of session.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const list = async (
  req,
  res,
  fns = {
    session_list: session_service.list,
  }
) => {
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request
  try {
    const id_user = token.getUserId({ token: req.headers['authorization'] });
    return await Promise.resolve(fns.session_list({ id_user })).then(
      (sessions) => {
        logs.info(
          `[${req.method}][200] ${req.originalUrl} : List of sessions transmitted.`
        );
        return res.status(200).json({
          result: sessions.map((session) => session.public_format()),
        });
      }
    );
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
 * Controller that checks parameters and fetch the a specific session.
 * @param {*} req HTTP request.
 * @param {*} res HTTP response.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const get = async (
  req,
  res,
  fns = {
    session_get: session_service.get,
  }
) => {
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request
  try {
    parametres.check_query(req, ['id_session']);

    if (!parametres.check_id(req.query.id_session))
      throw new ParameterMisformed(
        'The req.query.id_session parameter is misformed.'
      );
    const id_user = token.getUserId({ token: req.headers['authorization'] });
    return await Promise.resolve(
      fns.session_get({ id_session: req.query.id_session, id_user })
    ).then((session) => {
      logs.info(
        `[${req.method}][200] ${req.originalUrl} : Session transmitted.`
      );
      return res.status(200).json({
        result: session.public_format(),
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
