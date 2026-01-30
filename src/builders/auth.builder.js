import db from '../config/db.config.js';
import * as parametres from '../utils/parametres.service.js';
import { User } from '../objects/User.js';
import {
  DBObjectNotFound,
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.service.js';
import { UserRole } from '../objects/UserRole.js';

/**
 * Builder that change the role of user.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const update = async function (
  props = {
    role: undefined,
    id_user: undefined,
  }
) {
  try {
    const option = {
      where: { label: props.role },
    };
    const user_role = await Promise.resolve(
      db.caelus.USER_ROLE.findOne(option)
    ).then((r) => {
      if (r == null) throw new DBObjectNotFound('The role could not be found.');
      return r;
    });

    const values_update = { id_role: user_role.id_role };
    const options_update = {
      where: { id_user: props.id_user },
      returning: true,
    };
    return await Promise.resolve(
      db.caelus.USERS.update(values_update, options_update)
    ).then((r) => {
      if (r[0] === 0)
        throw new DBObjectNotFound('The user role could not be updated.');
      return new User({
        id_user: props.id_user,
        lastname: r[0].lastname,
        firstname: r[0].firstname,
        mail: r[0].mail,
        role: props.role,
        pwd: undefined,
      });
    });
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that gets the UserRole from the id_role given.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const role_by_id = async function (
  props = {
    id_role: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_role: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_role))
    throw new ParameterMisformed('The props.id_role parameter is misformed.');

  try {
    const options = {
      where: {
        id_role: props.id_role,
      },
    };
    return await Promise.resolve(db.caelus.USER_ROLE.findOne(options)).then(
      (r) => {
        if (!r) throw new DBObjectNotFound('The user role could not be found.');
        return new UserRole({
          id_role: r.id_role,
          label: r.label,
        });
      }
    );
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};
/**
 * Builder that gets the UserRole from the label given.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const role_by_label = async function (
  props = {
    label: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    label: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_user_role(props.label))
    throw new ParameterMisformed('The props.label parameter is misformed.');

  try {
    const options = {
      where: {
        label: props.label,
      },
    };
    return await Promise.resolve(db.caelus.USER_ROLE.findOne(options)).then(
      (r) => {
        if (!r) throw new DBObjectNotFound('The user role could not be found.');
        return new UserRole({
          id_role: r.id_role,
          label: r.label,
        });
      }
    );
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};
