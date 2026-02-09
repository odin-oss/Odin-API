import * as parametres from '../../src/utils/parametres.service.js';
import { MissingArgumentError, ParameterMisformed } from './errors.service.js';

/**
 * Function that will replace the tag keyname with the real value for customing environment.
 * @param {*} value
 * @param {*} custom_values
 * @returns
 */
export const parsing_generic_tags = function (
  value = '',
  custom_values = undefined
) {
  if (custom_values === undefined) return value;
  // We check all mandatory props before doing anything
  const expected_props = {
    username: undefined,
    label: undefined,
    password: undefined,
    hash: undefined,
    generated_label: undefined,
    web_title: undefined,
  };
  if (parametres.check_props(expected_props, custom_values).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, custom_values)}) are missing.`
    );
  if (!parametres.check_hash(custom_values.hash))
    throw new ParameterMisformed(
      'The custom_values.hash parameter is misformed.'
    );
  if (!parametres.check_libelle(custom_values.label))
    throw new ParameterMisformed(
      'The custom_values.label parameter is misformed.'
    );
  if (!parametres.check_libelle(custom_values.generated_label))
    throw new ParameterMisformed(
      'The custom_values.generated_label parameter is misformed.'
    );
  if (!parametres.check_libelle(custom_values.username))
    throw new ParameterMisformed(
      'The custom_values.username parameter is misformed.'
    );
  if (
    !parametres.check_libelle(custom_values.target) &&
    custom_values.target !== ''
  )
    throw new ParameterMisformed(
      'The custom_values.target parameter is misformed.'
    );

  let result = value.replace('<hash>', `${custom_values.hash}`);
  result = result.replace('<username>', `${custom_values.username}`);
  result = result.replace('<password>', `${custom_values.password}`);
  result = result.replace(
    '<generated_label>',
    `${custom_values.generated_label}`
  );
  result = result.replace('<target>', `${custom_values.target}`);
  result = result.replace(
    '<subpath>',
    `/${custom_values.hash}/${custom_values.label}${custom_values.target ? '-terminal' : ''}`
  );
  result = result.replace('<vm_name>', `${custom_values.web_title}`);
  return result;
};
