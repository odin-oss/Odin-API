import * as environment_service from '../services/environment.service.js';
import { counter_get, counter } from '../middlewares/prometheus.js';
import { ApiResponse } from '../utils/response.util.js';
import logs from '../middlewares/winston.js';
import z from 'zod';
import Guard from '../utils/guard.util.js';

/**
 * Controller that checks parameters and return the list of environments.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const list = async function (
  req,
  res,
  fns = {
    environment_list: environment_service.list,
  }
) {
  // Prometheus
  counter_get.inc();
  counter.inc();

  //Request
  await fns
    .environment_list()
    .then((environments) =>
      ApiResponse.success(
        req,
        res,
        environments.map((env) => env.public_format()),
        200,
        'List of environments transmitted.'
      )
    )
    .catch((err) => {
      logs.debug(err);
      ApiResponse.error(req, res, err);
    });
};

/**
 * Controller that checks the request before creating a new environment.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const create = async function (
  req,
  res,
  fns = {
    create: environment_service.create,
  }
) {
  try {
    const schema = z.object({
      label: z.string().min(2),
      icon: z.string().min(2),
    });
    const data = Guard.validateProps(schema, req.body);
    return await fns
      .create(data)
      .then((env) =>
        ApiResponse.success(
          req,
          res,
          env.toJSON(),
          200,
          'New environment created.'
        )
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};
/**
 * Controller that checks the request before attaching the interface to the environment.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const attach_interface = async function (
  req,
  res,
  fns = {
    attach_interface: environment_service.attach_interface,
  }
) {
  try {
    const body_schema = z.object({
      id_interface: z.coerce.number().int().positive(),
      label: z.string().min(2),
    });
    const body_data = Guard.validateProps(body_schema, req.body);
    const params_schema = z.object({
      id_environment: z.coerce.number().int().positive(),
    });
    const params_data = Guard.validateProps(params_schema, req.params);
    return await fns
      .attach_interface({
        ...body_data,
        id_environment: params_data.id_environment,
      })
      .then((env) =>
        ApiResponse.success(
          req,
          res,
          env.toJSON(),
          200,
          'The interface has been attached to the Environment.'
        )
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};
/**
 * Controller that checks the request before detaching the interface from the environment.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const detach_interface = async function (
  req,
  res,
  fns = {
    detach_interface: environment_service.detach_interface,
  }
) {
  try {
    const body_schema = z.object({
      id_interface: z.coerce.number().int().positive(),
    });
    const body_data = Guard.validateProps(body_schema, req.body);
    const params_schema = z.object({
      id_environment: z.coerce.number().int().positive(),
    });
    const params_data = Guard.validateProps(params_schema, req.params);
    return await fns
      .detach_interface({
        id_environment: params_data.id_environment,
        id_interface: body_data.id_interface,
      })
      .then((env) =>
        ApiResponse.success(
          req,
          res,
          env.toJSON(),
          200,
          'The interface has been detached from the environment.'
        )
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks the request before updating label & icon of the environment.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const update = async function (
  req,
  res,
  fns = {
    update: environment_service.update,
  }
) {
  try {
    const body_schema = z.object({
      label: z.string().min(2),
      icon: z.string().min(2),
    });
    const body_data = Guard.validateProps(body_schema, req.body);
    const params_schema = z.object({
      id_environment: z.coerce.number().int().positive(),
    });
    const params_data = Guard.validateProps(params_schema, req.params);
    return await fns
      .update({
        ...body_data,
        id_environment: params_data.id_environment,
      })
      .then((env) =>
        ApiResponse.success(
          req,
          res,
          env.toJSON(),
          200,
          'The label of the environment has been updated.'
        )
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Function that checks the request before updating the label of the interface inside the environment.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const update_interface = async function (
  req,
  res,
  fns = {
    update_interface: environment_service.update_interface,
  }
) {
  try {
    const body_schema = z.object({
      label: z.string().min(2),
      id_interface: z.coerce.number().int().positive(),
    });
    const body_data = Guard.validateProps(body_schema, req.body);
    const params_schema = z.object({
      id_environment: z.coerce.number().int().positive(),
    });
    const params_data = Guard.validateProps(params_schema, req.params);
    return await fns
      .update_interface({
        ...body_data,
        id_environment: params_data.id_environment,
      })
      .then((env) =>
        ApiResponse.success(
          req,
          res,
          env.toJSON(),
          200,
          'The label of the interface inside the environment has been updated.'
        )
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks the request before deleting the environment.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const del = async function (
  req,
  res,
  fns = {
    del: environment_service.del,
  }
) {
  try {
    const body_schema = z.object({
      id_environment: z.coerce.number().int().positive(),
    });
    const body_data = Guard.validateProps(body_schema, req.body);
    return await fns
      .del({
        id_environment: body_data.id_environment,
      })
      .then((env) =>
        ApiResponse.success(req, res, env.toJSON(), 200, 'Environment deleted.')
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};
