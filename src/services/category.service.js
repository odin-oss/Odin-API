import * as category_builder from '../builders/category.builder.js';

/**
 * Service that is used to get the full list of categories.
 * @param {*} fns overwriting tests functions for test
 * @returns
 */
export const list = async function (
  fns = {
    category_list: category_builder.list,
  }
) {
  return await fns.category_list();
};
