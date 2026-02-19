import * as category_service from '../services/category.service.js';
import { counter_get, counter } from '../middlewares/prometheus.js';
import { ApiResponse } from '../utils/response.util.js';
import z from 'zod';
import Guard from '../utils/guard.util.js';
import { role } from '../services/auth.service.js';
import { getUserId } from '../utils/token.util.js';
import logs from '../middlewares/winston.js';

/**
 * Controller that checks parameters and return the list of categories.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const list = async function (
  req,
  res,
  fns = {
    category_list: category_service.list,
    user_role: role,
  }
) {
  // Prometheus
  counter_get.inc();
  counter.inc();
  try {
    const id_user = getUserId({ token: req.headers['authorization'] });
    const schema = z.object({
      all: z
        .preprocess((val) => String(val).toLocaleLowerCase(), z.string())
        .transform((val) => val === 'true')
        .default(false),
    });
    const data = Guard.validateProps(schema, req.query);

    let all = false;
    if (data.all) all = (await fns.user_role({ id_user })) === 'ADMINISTRATEUR';

    //Request
    await fns.category_list({ all }).then((categories) =>
      ApiResponse.success(
        req,
        res,
        categories.map((category) => category.public_format()),
        200,
        'List of categories transmitted.'
      )
    );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks the request before creating a new category.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const create = async function (
  req,
  res,
  fns = {
    create: category_service.create,
  }
) {
  try {
    const schema = z.object({
      label: z.string().min(2),
      google_material_icon: z.string().min(2),
    });
    const data = Guard.validateProps(schema, req.body);
    await fns
      .create({
        label: data.label,
        google_material_icon: data.google_material_icon,
      })
      .then((category) =>
        ApiResponse.success(
          req,
          res,
          category.toJSON(),
          200,
          'New Category created.'
        )
      );
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks the request before detaching the environment from the category.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const detach_environment = async function (
  req,
  res,
  fns = {
    detach_environment: category_service.detach_environment,
  }
) {
  try {
    const body_schema = z.object({
      id_environment: z.coerce.number().int().positive()
    });
    const params_schema = z.object({
      id_category: z.coerce.number().int().positive()
    });
    const body_data = Guard.validateProps(body_schema, req.body);
    const params_data = Guard.validateProps(params_schema, req.params);
    return await fns.detach_environment({
      id_category: params_data.id_category,
      id_environment: body_data.id_environment,
    })
      .then((category) => ApiResponse.success(req, res, category.toJSON(), 200, 'The environment has been detached from the category.'));
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks the request before attaching a new environment to this category.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const attach_environment = async function (
  req,
  res,
  fns = {
    attach_environment: category_service.attach_environment,
  }
) {
  try {
    const body_schema = z.object({
      id_environment: z.coerce.number().int().positive()
    });
    const params_schema = z.object({
      id_category: z.coerce.number().int().positive()
    });
    const body_data = Guard.validateProps(body_schema, req.body);
    const params_data = Guard.validateProps(params_schema, req.params);
    return await fns.attach_environment({
      id_category: params_data.id_category,
      id_environment: body_data.id_environment,
    })
      .then((category) => ApiResponse.success(req, res, category.toJSON(), 200, 'The environment has been attached to the category.'));
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks the request before executing the update of the Category.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const update = async function (
  req,
  res,
  fns = {
    update: category_service.update,
  }
) {
  try {
    const body_schema = z.object({
      google_material_icon: z.string().min(2),
      label: z.string().min(2)
    });
    const params_schema = z.object({
      id_category: z.coerce.number().int().positive()
    });
    const body_data = Guard.validateProps(body_schema, req.body);
    const params_data = Guard.validateProps(params_schema, req.params);
    return await fns.update({
      ...body_data,
      id_category: params_data.id_category,
    })
      .then((category) => ApiResponse.success(req, res, category.toJSON(), 200, 'Category updated.'));
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};

/**
 * Controller that checks the request before executing the deletion of the category.
 * @param {Request} req HTTP request.
 * @param {Response} res HTTP response.
 * @param {Function} fns overwriting functions for tests.
 */
export const del = async function (
  req,
  res,
  fns = {
    del: category_service.del,
  }
) {
  try {
    const schema = z.object({
      id_category: z.coerce.number().int().positive()
    });
    const data = Guard.validateProps(schema, req.body);
    return await fns.del(data)
      .then((category) => ApiResponse.success(req, res, category.toJSON(), 200, 'Category deleted.'));
  } catch (err) {
    logs.debug(err);
    ApiResponse.error(req, res, err);
  }
};
