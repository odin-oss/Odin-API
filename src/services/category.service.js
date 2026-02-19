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
