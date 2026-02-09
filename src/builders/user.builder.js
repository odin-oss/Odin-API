import dbManager from '../config/db.config.js';
import { User } from '../objects/User.js';
import {
  DBObjectNotFound,
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.util.js';
import { Op } from 'sequelize';
import Guard from '../utils/guard.util.js';

/**
 * Builder that fetch the user informations from the database.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const get = async function (
  props = {
    id_user: undefined,
    mail: undefined,
  }
) {
  if (props.id_user === undefined && props.mail === undefined)
    throw new MissingArgumentError(
      `One or multiple arguments (id_user,mail) are missing.`
    );
  if (props.mail !== undefined && !Guard.check_email(props.mail))
    throw new ParameterMisformed('The props.mail parameter is misformed.');
  if (props.id_user !== undefined && !Guard.check_id(props.id_user))
    throw new ParameterMisformed('The props.id_user parameter is misformed.');
  const options = {
    include: [
      {
        model: dbManager.models.USER_ROLE,
        required: true,
      },
      {
        model: dbManager.models.PASSWORD,
        required: true,
      },
    ],
  };
  if (props.id_user !== undefined) options.where = { id_user: props.id_user };
  else options.where = { mail: props.mail };
  return await Promise.resolve(dbManager.models.USERS.findOne(options))
    .then((r) => {
      if (r == null) throw new DBObjectNotFound('The user could not be found.');
      return new User({
        id_user: r.id_user,
        lastname: r.lastname,
        firstname: r.firstname,
        mail: r.mail,
        pwd: r.PASSWORD.pwd,
        role: r.USER_ROLE.label,
      });
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};

/**
 * Function used to fetch all the users in a certain user_role.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const list = async function (
  props = {
    role: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    role: undefined,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_user_role(props.role))
    throw new ParameterMisformed('The props.role parameter is misformed.');

  try {
    const options = {
      include: {
        model: dbManager.models.USER_ROLE,
        required: true,
        where: { label: props.role },
      },
    };
    return await Promise.resolve(dbManager.models.USERS.findAll(options)).then(
      (r) => {
        const result = [];
        for (const user of r)
          result.push(
            new User({
              id_user: user.id_user,
              lastname: user.lastname,
              firstname: user.firstname,
              mail: user.mail,
              role: user.USER_ROLE.label,
            })
          );
        return result;
      }
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Function used to fetch all the users in the array of ids.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const get_list = async function (
  props = {
    ids: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    ids: undefined,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_ids(props.ids))
    throw new ParameterMisformed('The props.ids parameter is misformed.');

  try {
    const options = {
      where: {
        id_user: {
          [Op.in]: props.ids,
        },
      },
      include: {
        model: dbManager.models.USER_ROLE,
        required: true,
      },
    };
    return await Promise.resolve(dbManager.models.USERS.findAll(options)).then(
      (r) => {
        const result = [];
        for (const user of r)
          result.push(
            new User({
              id_user: user.id_user,
              lastname: user.lastname,
              firstname: user.firstname,
              mail: user.mail,
              role: user.USER_ROLE.label,
            })
          );
        return result;
      }
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that update the user's password in the database.
 * @param {*} props {id_user, password}
 * @param {*} fns overwriting functions for tests.
 * @returns User {}
 */
export const update_password = async function (
  props = {
    id_user: undefined,
    hashed_password: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_user: undefined,
    hashed_password: undefined,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_id(props.id_user))
    throw new ParameterMisformed('The props.id_user parameter is misformed.');

  const options = {
    where: {
      id_user: props.id_user,
    },
  };
  const user = await Promise.resolve(dbManager.models.USERS.findOne(options));
  if (user == null) throw new DBObjectNotFound('The user could not be found.');

  const opt_update = {
    pwd: props.hashed_password,
  };
  const opt_condition = {
    where: {
      id_password: user.id_password,
    },
  };

  return await Promise.resolve(
    dbManager.models.PASSWORD.update(opt_update, opt_condition)
  )
    .then((response) => {
      return "The user's password has been changed.";
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};

/**
 * Builder that creates a new User object in the database.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const create = async function (
  props = {
    firstname: undefined,
    lastname: undefined,
    mail: undefined,
    id_role: undefined,
    hashed_password: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    firstname: undefined,
    lastname: undefined,
    mail: undefined,
    id_role: undefined,
    hashed_password: undefined,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_id(props.id_role))
    throw new ParameterMisformed('The props.id_role parameter is misformed.');

  try {
    // creating the pwd
    const options_pwd = {
      pwd: props.hashed_password,
    };
    const pwd_creation = dbManager.models.PASSWORD.create(options_pwd);
    const pwd = await Promise.resolve(pwd_creation);

    // creating the user
    const options = {
      firstname: props.firstname,
      lastname: props.lastname,
      mail: props.mail,
      id_role: props.id_role,
      id_password: pwd.id_password,
    };
    return await Promise.resolve(dbManager.models.USERS.create(options)).then(
      (r) => {
        return new User({
          id_user: r.id_user,
          lastname: r.lastname,
          firstname: r.firstname,
          mail: r.mail,
        });
      }
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
