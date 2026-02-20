import logs from '../middlewares/winston.js';
import * as interface_service from '../services/interface.service.js';
import z from 'zod';
import Guard from '../utils/guard.util.js';
import { ApiResponse } from '../utils/response.util.js';
import { schema } from '@hapi/joi/lib/compile.js';

/**
 * Controller that checks request before getting informations about a specific interface.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const get = async function (
  req,
  res,
  fns = {
    interface_get: interface_service.get,
  }
) {
  try {
    const schema = z.object({
      id_interface: z.coerce.number().int().positive(),
    });
    const data = Guard.validateProps(schema, req.query);
    await fns
      .interface_get({
        id_interface: data.id_interface,
      })
      .then((response) =>
        ApiResponse.success(
          req,
          res,
          response.toJSON(),
          200,
          'Interface transmitted.'
        )
      );
  } catch (error) {
    logs.debug(error);
    ApiResponse.error(req, res, error);
  }
};

/**
 * Controller that checks request before getting informations about all interfaces.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const list = async function (
  req,
  res,
  fns = {
    interface_list: interface_service.list,
  }
) {
  await fns.interface_list()
    .then((response) => ApiResponse.success(req, res, response.map((inter) => inter.toJSON()), 200, 'List of interfaces transmitted.'))
    .catch((error) => {
      logs.debug(error);
      ApiResponse.error(req, res, error);
    });
};
/**
 * Controller that checks request before creating a new interface.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const create = async function (
  req,
  res,
  fns = {
    interface_create: interface_service.create,
  }
) {
  try {
    const schema = z.object({
      label: z.preprocess(
        (val) =>
          String(val)
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase(),
        z.string().min(2).max(255)
      ),
      registry_link: z.string().min(2).max(255),
      exec_command: z.string().min(2).max(255),
      service_command: z.string().min(2).max(255),
      id_type: z.coerce.number().int().positive(),
      need_compute_gpu: z.preprocess((val) => String(val).toLocaleLowerCase(), z.string())
        .transform((val) => val === 'true')
        .default(false),
      need_graphical_rendering_gpu: z.preprocess((val) => String(val).toLocaleLowerCase(), z.string())
        .transform((val) => val === 'true')
        .default(false),
      cpu_request: z.union([
        z.number().int({ message: "The CPU must be a string or an integer." }),
        z.string().regex(/^\d+m?$/, { message: "The string value of the CPU must be xx or xxm, xx being the integer." })]),
      ram_request: z.string({ invalid_type_error: "The RAM value must be a string." })
        .regex(/^\d+(Gi|Mi)$/, { message: "The RAM value must be as xxGi or xxMi, xx being the integer." }),
      cpu_limit: z.union([
        z.number().int({ message: "The CPU must be a string or an integer." }),
        z.string().regex(/^\d+m?$/, { message: "The string value of the CPU must be xx or xxm, xx being the integer." })]),
      ram_limit: z.string({ invalid_type_error: "The RAM value must be a string." })
        .regex(/^\d+(Gi|Mi)$/, { message: "The RAM value must be as xxGi or xxMi, xx being the integer." }),
      readiness_probe_initial_delay: z.coerce.number().int().positive(),
      readiness_probe_period: z.coerce.number().int().positive(),
      liveness_probe_initial_delay: z.coerce.number().int().positive(),
      liveness_probe_period: z.coerce.number().int().positive(),
      egress_bandwidth: z.string({ invalid_type_error: "The bandwidth must be sent in string." })
        .regex(/^\d+[MG]$/, { message: "The bandwidth should be like xxM or xxG, xx being your number value." }),
      ingress_bandwidth: z.string({ invalid_type_error: "The bandwidth must be sent in string." })
        .regex(/^\d+[MG]$/, { message: "The bandwidth should be like xxM or xxG, xx being your number value." })
    });
    const data = Guard.validateProps(schema, req.body);
    await fns.interface_create(data)
      .then((inter) => ApiResponse.success(req, res, inter.toJSON(), 200, 'Interface created.'));
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};
/**
 * Controller that checks request before launching update of interface.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const update = async function (
  req,
  res,
  fns = {
    update: interface_service.update,
  }
) {
  try {
    const params_schema = z.object({
      id_interface: z.coerce.number().int().positive()
    });
    const params_data = Guard.validateProps(params_schema, req.params);
    const body_schema = z.object({
      label: z.preprocess(
        (val) =>
          String(val)
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase(),
        z.string().min(2).max(255)
      ).optional(),
      registry_link: z.string().min(2).max(255).optional(),
      exec_command: z.string().min(2).max(255).optional(),
      service_command: z.string().min(2).max(255).optional(),
      id_type: z.coerce.number().int().positive().optional(),
      need_compute_gpu: z.preprocess((val) => String(val).toLocaleLowerCase(), z.string())
        .transform((val) => val === 'true')
        .optional(),
      need_graphical_rendering_gpu: z.preprocess((val) => String(val).toLocaleLowerCase(), z.string())
        .transform((val) => val === 'true')
        .optional(),
      cpu_request: z.union([
        z.number().int({ message: "The CPU must be a string or an integer." }),
        z.string().regex(/^\d+m?$/, { message: "The string value of the CPU must be xx or xxm, xx being the integer." })]).optional(),
      ram_request: z.string({ invalid_type_error: "The RAM value must be a string." })
        .regex(/^\d+(Gi|Mi)$/, { message: "The RAM value must be as xxGi or xxMi, xx being the integer." }).optional(),
      cpu_limit: z.union([
        z.number().int({ message: "The CPU must be a string or an integer." }),
        z.string().regex(/^\d+m?$/, { message: "The string value of the CPU must be xx or xxm, xx being the integer." })]).optional(),
      ram_limit: z.string({ invalid_type_error: "The RAM value must be a string." })
        .regex(/^\d+(Gi|Mi)$/, { message: "The RAM value must be as xxGi or xxMi, xx being the integer." }).optional(),
      readiness_probe_initial_delay: z.coerce.number().int().positive().optional(),
      readiness_probe_period: z.coerce.number().int().positive().optional(),
      liveness_probe_initial_delay: z.coerce.number().int().positive().optional(),
      liveness_probe_period: z.coerce.number().int().positive().optional(),
      egress_bandwidth: z.string({ invalid_type_error: "The bandwidth must be sent in string." })
        .regex(/^\d+[MG]$/, { message: "The bandwidth should be like xxM or xxG, xx being your number value." })
        .optional(),
      ingress_bandwidth: z.string({ invalid_type_error: "The bandwidth must be sent in string." })
        .regex(/^\d+[MG]$/, { message: "The bandwidth should be like xxM or xxG, xx being your number value." })
        .optional(),
      args: z.array(z.string({ invalid_type_error: "Each argument must be a string." }),
        { invalid_type_error: "Args should be an array of string." }).optional(),
      node_selectors: z.array(z.coerce.number().int().positive({ message: "Each ID must be a positive integer." }), { invalid_type_error: "Arrays of ids should be an array." }).optional(),
      ports: z.array(
        z.object({
          port: z.coerce.number().int().positive(),
          id_port_type: z.coerce.number().int().positive(),
          icon: z.string().min(2).max(255),
          label: z.string().min(2).max(255),
          display_name: z.string().min(2).max(255),
        }, { invalid_type_error: "Each port must be an object with the required keys." }),
        { invalid_type_error: "Ports should be an array of port objects" })
        .optional(),
      envs: z.array(
        z.union([
          z.object({ id_variable_environment: z.coerce.number().int().positive() }),
          z.object({ key: z.string().min(1), value: z.string() })
        ],
          { errorMap: () => ({ message: 'The env object should have: key and value OR id_variable_environment.' }) }),
        { invalid_type_error: 'Envs should be an array.' })
        .optional()
    });
    const body_data = Guard.validateProps(body_schema, req.body);
    await fns.update({ ...body_data, id_interface: params_data.id_interface })
      .then((inter) => ApiResponse.success(req, res, inter.toJSON(), 200, 'Interface updated.'));
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};
