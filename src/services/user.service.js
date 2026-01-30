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

/**
 * Service used to get the User object from the id_user.
 * @param {*} props {id_user}
 * @param {*} fns overwriting functions for test
 * @returns User
 */
export const get = async function (
  props = {
    id_user: undefined,
  },
  fns = {
    user_get: user_builder.get,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_user: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_user))
    throw new ParameterMisformed('The props.id_user parameter is misformed.');
  return await Promise.resolve(fns.user_get({ id_user: props.id_user })).then(
    (user) => {
      return user;
    }
  );
};

/**
 * Service used to get the list of all User on a specific user_role.
 * @param {*} props {user_role}
 * @param {*} fns overwriting functions for test
 * @returns [User {}, ...]
 */
export const list_by_role = async function (
  props = {
    user_role: undefined,
  },
  fns = {
    user_list: user_builder.list,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    user_role: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_user_role(props.user_role))
    throw new ParameterMisformed('The props.user_role parameter is misformed.');
  return await Promise.resolve(fns.user_list({ role: props.user_role })).then(
    (users) => {
      return users;
    }
  );
};

/**
 * Service used to get the User object from the id_user.
 * @param {*} props {id_user}
 * @param {*} fns overwriting functions for test
 * @returns User
 */
export const update_password = async function (
  props = {
    id_user: undefined,
    password: undefined,
    old_password: undefined,
  },
  fns = {
    user_update_password: user_builder.update_password,
    user_get: user_builder.get,
    bcrypt: bcrypt,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_user: undefined,
    password: undefined,
    old_password: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_user))
    throw new ParameterMisformed('The props.id_user parameter is misformed.');

  const user = await Promise.resolve(fns.user_get({ id_user: props.id_user }));
  if (!fns.bcrypt.compareSync(props.old_password, user.pwd))
    throw new BadCredentials('The old password is not correct.');
  parametres.check_password(props.password);

  return await Promise.resolve(
    fns.user_update_password({
      id_user: props.id_user,
      hashed_password: fns.bcrypt.hashSync(props.password, 11),
    })
  ).then((response) => {
    return user;
  });
};
/**
 * Service used to create a new User object.
 * @param {*} props {User}
 * @param {*} fns overwriting functions for test
 * @returns User
 */
export const create = async function (
  props = {
    mail: undefined,
    pwd: undefined,
    role: undefined,
    lastname: undefined,
    firstname: undefined,
  },
  fns = {
    bcrypt: bcrypt,
    create: user_builder.create,
    role_by_label: role_by_label,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    mail: undefined,
    pwd: undefined,
    role: undefined,
    lastname: undefined,
    firstname: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_email(props.mail))
    throw new ParameterMisformed('The props.mail parameter is misformed.');
  if (!parametres.check_password(props.pwd))
    throw new ParameterMisformed('The props.pwd parameter is misformed.');
  if (!parametres.check_user_role(props.role))
    throw new ParameterMisformed('The props.role parameter is misformed.');
  const hashed_password = fns.bcrypt.hashSync(props.pwd, 11);
  const role = await fns.role_by_label({ label: props.role });
  return await Promise.resolve(
    fns.create({
      firstname: props.firstname,
      lastname: props.lastname,
      mail: props.mail,
      id_role: role.id_role,
      hashed_password: hashed_password,
    })
  ).then((user) => {
    user.role = role.label;
    user.pwd = props.pwd;
    return user;
  });
};
