import * as user_builder from '../builders/user.builder.js';
import bcrypt from 'bcrypt';
import * as token from '../utils/token.service.js';
import * as parametres from '../utils/parametres.service.js';
import {
  BadCredentials,
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.service.js';

/**
 * Service used to test the connexion of the user to the API.
 * @param {*} props {mail,password}
 * @param {*} fns overwriting functions for tests
 * @returns token
 */
export const connect = async function (
  props = {
    mail: undefined,
    password: undefined,
  },
  fns = {
    user_get: user_builder.get,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    mail: undefined,
    password: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_email(props.mail))
    throw new ParameterMisformed('The props.mail parameter is misformed.');

  return await Promise.resolve(fns.user_get({ mail: props.mail })).then(
    (user) => {
      if (!bcrypt.compareSync(props.password, user.pwd))
        throw new BadCredentials('The credentials you entered are wrong.');
      return token.generateToken({ id_user: user.id_user });
    }
  );
};

/**
 * Getting the role from the user's informations.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const role = async function (
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
      return user.role;
    }
  );
};
