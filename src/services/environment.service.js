import * as environment_builder from '../builders/environment.builder.js';
import { Environment } from '../objects/Environment.js';
import Guard from '../utils/guard.util.js';

/**
 * Service that list all the Environments in an object array.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Array<Environment>}
 */
export const list = async (
  fns = {
    environment_list: environment_builder.list,
  }
) => {
  return await fns.environment_list();
};

/**
 * Service that will get a specific Environment.
 * @param {Number} id_environment id of the environment to get.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const get = async function (
  props,
  fns = {
    environment_get: environment_builder.get,
  }
) {
  const schema = z.object({
    id_environment: z.number().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.environment_get({ ...data });
};
