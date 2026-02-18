import * as category_builder from '../builders/category.builder.js';
import { Category } from '../objects/Category.js';

/**
 * Service that is used to get the full list of categories.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Array<Category>}
 */
export const list = async function (
  fns = {
    category_list: category_builder.list,
  }
) {
  return await fns.category_list();
};
