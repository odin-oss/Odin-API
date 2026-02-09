import * as interface_builder from '../builders/interface.builder.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.service.js';
import Guard from '../utils/guard.service.js';

/**
 * Service that will get a specific interface infos and send back an Interface object.
 * @param {*} props {id_interface}
 * @param {*} fns overwriting functions for tests
 * @returns Interface {}
 */
export const get = async function (
  props = { id_interface: undefined },
  fns = {
    interface_get: interface_builder.get,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_interface: undefined,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_id(props.id_interface))
    throw new ParameterMisformed(
      'The props.id_interface parameter is misformed.'
    );
  return await Promise.resolve(
    fns.interface_get({ id_interface: props.id_interface })
  ).then((int) => {
    return int;
  });
};
