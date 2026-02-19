import * as argument_builder from '../builders/argument.builder.js';

/**
 * Listing all the arguments.
 * @param {Function} fns overwriting functions for tests purposes.
 * @returns {Array<Argument>}
 */
export const list = async function (
  fns = {
    argument_list: argument_builder.list,
  }
) {
  return await fns.argument_list();
};
