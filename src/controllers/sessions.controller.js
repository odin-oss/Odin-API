import * as session_service from '../services/session.service.js';
import {
  counter,
  counter_get,
  counter_post,
} from '../middlewares/prometheus.js';
import logs from '../middlewares/winston.js';
import * as token from '../utils/token.util.js';
import { ApiResponse } from '../utils/response.util.js';
import Guard from '../utils/guard.util.js';
import z from 'zod';
import CONFIG from '../config/config.js';
import moment from 'moment-timezone';

/**
 * Controller that checks parameters and create a new session.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
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
    Guard.check_body(req, [
      'label_session',
      'label_application',
      'id_environment',
      'id_datacenter',
      'begin_date',
      'end_date',
      'professors',
      'users',
    ]);
    const schema = z.object({
      id_environment: z.coerce.number().positive(),
      id_datacenter: z.coerce.number().positive(),
      professors: z.preprocess((val) => {
        if (typeof val === 'string') return JSON.parse(val);
        return val;
      }, z.array(z.coerce.number().int().positive()).default([])),
      users: z.preprocess((val) => {
        if (typeof val === 'string') return JSON.parse(val);
        return val;
      }, z.array(z.coerce.number().int().positive()).default([])),
      begin_date: z
        .refine((val) => moment(val).isValid(), {
          message: 'Invalid date format',
        })
        .transform((val) => moment(val).tz(CONFIG.APP_TZ)),
      end_date: z
        .refine((val) => moment(val).isValid(), {
          message: 'Invalid date format',
        })
        .transform((val) => moment(val).tz(CONFIG.APP_TZ)),
      label_session: z.string().default('n/a'),
      label_application: z.string().default('n/a'),
    });
    const data = Guard.validateProps(schema, req.body);
    await fns
      .session_create({
        ...data,
      })
      .then((session) =>
        ApiResponse.success(
          req,
          res,
          session.public_format(),
          200,
          'Session started.'
        )
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks parameters and fetch the list of session.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
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
    await fns.session_list({ id_user }).then((sessions) =>
      ApiResponse.success(
        req,
        res,
        sessions.map((session) => session.public_format()),
        200,
        'List of sessions transmitted.'
      )
    );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks parameters and fetch the a specific session.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
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
    Guard.check_query(req, ['id_session']);
    const schema = z.object({
      id_session: z.coerce.number().int().positive(),
    });
    const data = Guard.validateProps(schema, req.query);
    const id_user = token.getUserId({ token: req.headers['authorization'] });
    await fns
      .session_get({ id_session: data.id_session, id_user })
      .then((session) =>
        ApiResponse.success(
          req,
          res,
          session.public_format(),
          200,
          'Session transmitted.'
        )
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};
