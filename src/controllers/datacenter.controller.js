import * as datacenter_service from '../services/datacenter.service.js';
import {
  counter_get,
  counter,
  counter_post,
} from '../middlewares/prometheus.js';
import { ApiResponse } from '../utils/response.util.js';
import logs from '../middlewares/winston.js';
import z from 'zod';
import Guard from '../utils/guard.util.js';

/**
 * Controller that checks requets content before fetching all the datacenters in db.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const list = async (
  req,
  res,
  fns = {
    datacenter_list: datacenter_service.list,
  }
) => {
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request
  await fns
    .datacenter_list()
    .then((dcs) =>
      ApiResponse.success(
        req,
        res,
        dcs.map((dc) => dc.public_format()),
        200,
        'List of datacenters transmitted.'
      )
    )
    .catch((err) => {
      logs.debug(err);
      ApiResponse.error(req, res, err);
    });
};

/**
 * Controller that checks the content of request before creating a new datacenter.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const create = async function (
  req,
  res,
  fns = {
    create: datacenter_service.create,
  }
) {
  try {
    const schema = z.object({
      label: z.string().min(2),
      city: z.string().min(2),
      provider: z.string().min(2),
    });
    const data = Guard.validateProps(schema, req.body);
    return await fns
      .create(data)
      .then((dc) =>
        ApiResponse.success(req, res, dc.toJSON(), 200, 'Datacenter created.')
      );
  } catch (error) {
    logs.debug(error);
    ApiResponse.error(req, res, error);
  }
};

/**
 * Controller that checks the content of request before updating a datacenter.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const update = async function (
  req,
  res,
  fns = {
    update: datacenter_service.update,
  }
) {
  try {
    const body_schema = z.object({
      label: z.string().min(2),
      city: z.string().min(2),
      provider: z.string().min(2),
    });
    const body_data = Guard.validateProps(body_schema, req.body);
    const params_schema = z.object({
      id_datacenter: z.coerce.number().int().positive(),
    });
    const params_data = Guard.validateProps(params_schema, req.params);
    return await fns
      .update({
        ...body_data,
        id_datacenter: params_data.id_datacenter,
      })
      .then((dc) =>
        ApiResponse.success(req, res, dc.toJSON(), 200, 'Datacenter updated.')
      );
  } catch (error) {
    logs.debug(error);
    ApiResponse.error(req, res, error);
  }
};

/**
 * Controller that checks request content before launching deletion of datacenter.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const del = async function (
  req,
  res,
  fns = {
    del: datacenter_service.del,
  }
) {
  try {
    const schema = z.object({
      id_datacenter: z.coerce.number().int().positive(),
    });
    const data = Guard.validateProps(schema, req.params);
    return await fns
      .del(data)
      .then((dc) =>
        ApiResponse.success(req, res, dc.toJSON(), 200, 'Datacenter deleted.')
      );
  } catch (error) {
    logs.debug(error);
    ApiResponse.error(req, res, error);
  }
};

/**
 * Controller that checks the request content before fetching the corresponding datacenter.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const get = async function (
  req,
  res,
  fns = {
    get: datacenter_service.get,
  }
) {
  try {
    const schema = z.object({
      id_datacenter: z.coerce.number().int().positive(),
    });
    const data = Guard.validateProps(schema, req.params);
    return await fns
      .get({ id_datacenter: data.id_datacenter })
      .then((dc) =>
        ApiResponse.success(
          req,
          res,
          dc.toJSON(),
          200,
          'Datacenter transmitted.'
        )
      );
  } catch (error) {
    logs.debug(error);
    ApiResponse.error(req, res, error);
  }
};

/**
 * Controller that checks the request before adding an agent to a datacenter.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const addAgent = async function (
  req,
  res,
  fns = {
    addAgent: datacenter_service.addAgent,
  }
) {
  try {
    counter_post.inc();
    counter.inc();
    const schema = z.object({
      id_datacenter: z.coerce.number(),
      id_agent: z.string().min(2),
    });
    const data = Guard.validateProps(schema, req.params);
    return await fns
      .addAgent(data)
      .then((env) =>
        ApiResponse.success(
          req,
          res,
          env.toJSON(),
          200,
          'The agent has been added to the datacenter.'
        )
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};
