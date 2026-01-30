import { nameExists, hashExists } from '../builders/applications.builder.js';
import * as random_dictionary_builder from '../builders/randomdictionary.builder.js';
import * as crypto from 'crypto';
import { MissingArgumentError, ParameterMisformed } from './errors.service.js';
import * as parametres from '../utils/parametres.service.js';

/**
 * Method used to generate a label from the random_dictionary.
 * @param {*} props {count}
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const generate_label = async (
  props = { count: 3 },
  fns = { dictionary_list: random_dictionary_builder.list }
) => {
  // We check all mandatory props before doing anything
  const expected_props = {
    count: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.count))
    throw new ParameterMisformed('The props.count parameter is misformed.');
  return await Promise.resolve(fns.dictionary_list()).then((dictionary) => {
    let result = '';
    for (let i = 0; i < props.count; i++) {
      result =
        result +
        dictionary.words[
          Math.floor(Math.random() * (dictionary.words.length - 1))
        ];
      if (i !== props.count - 1) result = result + '-';
    }
    return result;
  });
};

/**
 * Method used to generate an unique label from random_dictionary.
 * @param {*} props {count}
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const generate_unique_label = async (
  props = {
    count: 3,
  },
  fns = {
    generate_label: generate_label,
    nameExists: nameExists,
  }
) => {
  // We check all mandatory props before doing anything
  const expected_props = {
    count: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.count))
    throw new ParameterMisformed('The props.count parameter is misformed.');
  let label = '';
  let exists = true;
  while (exists) {
    label = await fns.generate_label({ count: props.count });
    exists = await fns.nameExists({ name: label });
  }
  return label;
};

/**
 * Method used to generate an unique hash with crypto.
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const generate_unique_hash = async (
  fns = {
    hashExists: hashExists,
  }
) => {
  let hash = '';
  let exists = true;
  while (exists) {
    hash = crypto.randomBytes(20).toString('hex').substring(0, 6);
    exists = await fns.hashExists({ hash });
  }
  return hash;
};
