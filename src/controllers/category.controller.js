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
