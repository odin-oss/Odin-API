import * as user_builder from '../builders/user.builder.js';
import bcrypt from 'bcrypt';
import * as token from '../utils/token.util.js';
import { BadCredentials } from '../utils/errors.util.js';
import Guard from '../utils/guard.util.js';
import z from 'zod';

/**
 * Service used to test the connexion of the user to the API.
 * @param {String} mail email of the user that is trying to connect.
 * @param {String} password password entered by the user.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {String}
 */
export const connect = async function (
  props,
  fns = {
    user_get: user_builder.get,
  }
) {
  const schema = z.object({
    mail: z.email(),
    password: z.string().min(1),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.user_get({ mail: data.mail }).then((user) => {
    if (!bcrypt.compareSync(data.password, user.pwd))
      throw new BadCredentials('The credentials you entered are wrong.');
    return token.generateToken({ id_user: user.id_user });
  });
};

/**
 * Getting the role from the user's informations.
 * @param {Number} id_user id of the user we want to get the role.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {String}
 */
export const role = async function (
  props,
  fns = {
    user_get: user_builder.get,
  }
) {
  const schema = z.object({
    id_user: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.user_get({ ...data }).then((user) => user.role);
};
