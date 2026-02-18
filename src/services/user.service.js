import * as user_builder from '../builders/user.builder.js';
import { User } from '../objects/User.js';
import { BadCredentials } from '../utils/errors.util.js';
import bcrypt from 'bcrypt';
import { role_by_label } from '../builders/auth.builder.js';
import z from 'zod';
import Guard from '../utils/guard.util.js';

/**
 * Service used to get the User object from the id_user.
 * @param {Number} id_user id of the user we want to get the infos.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {User}
 */
export const get = async function (
  props,
  fns = {
    user_get: user_builder.get,
  }
) {
  const schema = z.object({
    id_user: z.number().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.user_get({ ...data });
};

/**
 * Service used to get the list of all User on a specific user_role.
 * @param {String} role role we want the list of Users.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Array<User>}
 */
export const list_by_role = async function (
  props,
  fns = {
    user_list: user_builder.list,
  }
) {
  const schema = z.object({
    user_role: z.enum(['ETUDIANT', 'PROFESSEUR', 'ADMINISTRATEUR']),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.user_list(data);
};

/**
 * Service used to get the User object from the id_user.
 * @param {Number} id_user id of the user to update the password to.
 * @param {String} password new password to set to the user.
 * @param {String} old_password old password of the user.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const update_password = async function (
  props,
  fns = {
    user_update_password: user_builder.update_password,
    user_get: user_builder.get,
    bcrypt: bcrypt,
  }
) {
  const schema = z.object({
    id_user: z.number().positive(),
    password: z
      .string()
      .min(8, { message: 'The password must contains at least 8 characters.' })
      .refine((val) => /[0-9]/.test(val), {
        message: 'The password must contains at least 1 number.',
      })
      .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
        message: 'The password must contains at least 1 special char.',
      }),
    old_password: z.string(),
  });
  const data = Guard.validateProps(schema, props);
  const user = await fns.user_get({ ...data });
  if (!fns.bcrypt.compareSync(data.old_password, user.pwd))
    throw new BadCredentials('The old password is not correct.');
  return await fns.user_update_password({
    id_user: data.id_user,
    hashed_password: fns.bcrypt.hashSync(data.password, 11),
  });
};
/**
 * Service used to create a new User object.
 * @param {String} pwd password of the new User.
 * @param {String} mail mail of the new User.
 * @param {String} role role of the new User.
 * @param {String} lastname lastname of the new User.
 * @param {String} firstname firstname of the new User.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {User}
 */
export const create = async function (
  props,
  fns = {
    bcrypt,
    create: user_builder.create,
    role_by_label,
  }
) {
  const schema = z.object({
    pwd: z
      .string()
      .min(8, { message: 'The password must contains at least 8 characters.' })
      .refine((val) => /[0-9]/.test(val), {
        message: 'The password must contains at least 1 number.',
      })
      .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
        message: 'The password must contains at least 1 special char.',
      }),
    mail: z.email(),
    role: z.enum(['ETUDIANT', 'PROFESSEUR', 'ADMINISTRATEUR']),
    lastname: z.string().min(1),
    firstname: z.string().min(1),
  });
  const data = Guard.validateProps(schema, props);
  const hashed_password = fns.bcrypt.hashSync(data.pwd, 11);
  const role = await fns.role_by_label({ label: data.role });
  return await fns
    .create({
      ...data,
      id_role: role.id_role,
      hashed_password: hashed_password,
    })
    .then((user) => {
      user.role = role.label;
      user.pwd = data.pwd;
      return user;
    });
};
