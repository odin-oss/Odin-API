import * as user_builder from '../builders/user.builder.js';
import { User } from '../objects/User.js';
import {
  BadCredentials,
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.service.js';
import * as parametres from '../utils/parametres.service.js';
import bcrypt from 'bcrypt';
import { role_by_label } from '../builders/auth.builder.js';
import z from 'zod';

/**
 * Service used to get the User object from the id_user.
 * @param {*} props {id_user}
 * @param {*} fns overwriting functions for test
 * @returns User
 */
export const get = async function (
  props,
  fns = {
    user_get: user_builder.get,
  }
) {
  const data = User.validateProps(User.schema.pick({ id_user: true }), props);
  return await fns.user_get({ id_user: data.id_user });
};

/**
 * Service used to get the list of all User on a specific user_role.
 * @param {*} props {role}
 * @param {*} fns overwriting functions for test
 * @returns [User {}, ...]
 */
export const list_by_role = async function (
  props,
  fns = {
    user_list: user_builder.list,
  }
) {
  const data = User.validateProps(User.schema.pick({ role: true }), props);
  return await fns.user_list({ role: data.role });
};

/**
 * Service used to get the User object from the id_user.
 * @param {*} props {id_user}
 * @param {*} fns overwriting functions for test
 * @returns User
 */
export const update_password = async function (
  props,
  fns = {
    user_update_password: user_builder.update_password,
    user_get: user_builder.get,
    bcrypt: bcrypt,
  }
) {
  const data = User.validateProps(
    z
      .object({
        id_user: User.schema.shape.id_user,
        password: User.schema.shape.pwd,
        old_password: User.schema.shape.pwd,
      })
      .required(),
    props
  );
  const user = await fns.user_get({ id_user: data.id_user });
  if (!fns.bcrypt.compareSync(data.old_password, user.pwd))
    throw new BadCredentials('The old password is not correct.');
  parametres.check_password(data.password);

  return await fns.user_update_password({
    id_user: data.id_user,
    hashed_password: fns.bcrypt.hashSync(data.password, 11),
  });
};
/**
 * Service used to create a new User object.
 * @param {*} props {User}
 * @param {*} fns overwriting functions for test
 * @returns User
 */
export const create = async function (
  props,
  fns = {
    bcrypt: bcrypt,
    create: user_builder.create,
    role_by_label: role_by_label,
  }
) {
  const data = User.validateProps(
    User.schema
      .pick({
        mail: true,
        pwd: true,
        role: true,
        lastname: true,
        firstname: true,
      })
      .required(),
    props
  );
  const hashed_password = fns.bcrypt.hashSync(data.pwd, 11);
  const role = await fns.role_by_label({ label: data.role });
  return await fns
    .create({
      firstname: data.firstname,
      lastname: data.lastname,
      mail: data.mail,
      id_role: role.id_role,
      hashed_password: hashed_password,
    })
    .then((user) => {
      user.role = role.label;
      user.pwd = data.pwd;
      return user;
    });
};
