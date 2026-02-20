import z from 'zod';
import * as category_builder from '../builders/category.builder.js';
import { Category } from '../objects/Category.js';
import Guard from '../utils/guard.util.js';

/**
 * Service that is used to get the full list of categories.
 * @param {Boolean} all if true, listing the complete list of categories (admin only).
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Array<Category>}
 */
export const list = async function (
  props,
  fns = {
    category_list: category_builder.list,
  }
) {
  const schema = z.object({
    all: z.boolean().default(false),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.category_list({ ...data });
};

/**
 * Launch the creation of a new Category
 * @param {String} label label of the new category.
 * @param {String} google_material_icon icon of the category.
 * @param {Function} fns functions to overwrite for unit test.
 * @returns {Category}
 */
export const create = async function (
  props,
  fns = {
    category_create: category_builder.create,
  }
) {
  const schema = z.object({
    label: z.string().min(2),
    google_material_icon: z.string().min(2),
  });
  const data = Guard.validateProps(schema, props);
  return await Promise.resolve(fns.category_create({ ...data }));
};

/**
 * Detach an Environment from a Category.
 * @param {Number} id_category id of the category.
 * @param {Number} id_environment id of the environment.
 * @param {Function} fns functions to overwrite for testing purpose.
 * @returns {Category}
 */
export const detach_environment = async function (
  props,
  fns = {
    detach_environment: category_builder.detach_environment,
  }
) {
  const schema = z.object({
    id_environment: z.coerce.number().int().positive(),
    id_category: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.detach_environment(data);
};
/**
 * Attach a new Environment to the Category.
 * @param {Number} id_category id of the category.
 * @param {Number} id_environment id of the environment.
 * @param {Function} fns functions to overwrite for testing purpose.
 * @returns {Category}
 */
export const attach_environment = async function (
  props,
  fns = {
    attach_environment: category_builder.attach_environment,
  }
) {
  const schema = z.object({
    id_environment: z.coerce.number().int().positive(),
    id_category: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.attach_environment(data);
};

/**
 * Updating a Category.
 * @param {Number} id_category id of the category.
 * @param {String} label new label of the Category.
 * @param {String} google_material_icon new icon of the Category.
 * @param {Function} fns functions to overwrite for testing purpose.
 * @returns {Category}
 */
export const update = async function (
  props,
  fns = {
    category_update: category_builder.update,
  }
) {
  const schema = z.object({
    id_category: z.coerce.number().int().positive(),
    label: z.string().min(2),
    google_material_icon: z.string().min(2),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.category_update(data);
};

/**
 * Deletion of a specific Category.
 * @param {Number} id_category id of the category.
 * @param {Function} fns functions to overwrite for testing purpose.
 * @returns {Category}
 */
export const del = async function (
  props,
  fns = {
    category_del: category_builder.del,
  }
) {
  const schema = z.object({
    id_category: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.category_del(data);
};
