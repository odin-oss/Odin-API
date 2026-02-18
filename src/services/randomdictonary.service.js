import { nameExists, hashExists } from '../builders/applications.builder.js';
import * as random_dictionary_builder from '../builders/randomdictionary.builder.js';
import * as crypto from 'crypto';
import Guard from '../utils/guard.util.js';
import z from 'zod';
import { RandomDictionary } from '../objects/RandomDictionary.js';

/**
 * Method used to generate a label from the random_dictionary.
 * @param {Number} count count of random word to put - default 3.
 * @param {RandomDictionary} dictionary dictionary of words to pick in.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {String}
 */
export const generate_label = (props) => {
  const schema = z.object({
    count: z.number().default(3),
    dictionary: z.instanceof(RandomDictionary),
  });
  const data = Guard.validateProps(schema, props);
  let result = '';
  for (let i = 0; i < data.count; i++) {
    result =
      result +
      data.dictionary.words[
        Math.floor(Math.random() * (data.dictionary.words.length - 1))
      ];
    if (i !== props.count - 1) result = result + '-';
  }
  return result;
};

/**
 * Method used to generate an unique label from random_dictionary.
 * @param {Number} count count of random word to put - default 3
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {String}
 */
export const generate_unique_label = async (
  props,
  fns = {
    generate_label: generate_label,
    nameExists: nameExists,
  }
) => {
  const schema = z.object({
    count: z.number().default(3),
    dictionary: z.instanceof(RandomDictionary),
  });
  const data = Guard.validateProps(schema, props);
  let label = '';
  let exists = true;
  while (exists) {
    label = fns.generate_label({ ...data });
    exists = await fns.nameExists({ name: label });
  }
  return label;
};

/**
 * Method used to generate an unique hash with crypto.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {String}
 */
export const generate_unique_hash = async (
  fns = {
    hashExists,
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
