import * as environment_builder from '../builders/environment.builder.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.util.js';
import Guard from '../utils/guard.util.js';

/**
 * Service that list all the Environments in an object array.
 * @param {*} fns overwriting function for tests
 * @returns [Environment {}, ...]
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
 * @param {*} props {id_environment}
 * @param {*} fns overwriting function for tests
 * @returns Environment {}
 */
export const get = async function (
  props = {
    id_environment: undefined,
  },
  fns = {
    environment_get: environment_builder.get,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_environment: undefined,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_id(props.id_environment))
    throw new ParameterMisformed(
      'The props.id_environment parameter is misformed.'
    );
  return await fns.environment_get({ id_environment: props.id_environment });
};
