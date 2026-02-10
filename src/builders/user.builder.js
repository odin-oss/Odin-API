import dbManager from '../config/db.config.js';
import { User } from '../objects/User.js';
import {
  DBObjectNotFound,
  MissingArgumentError
} from '../utils/errors.util.js';
import { Op } from 'sequelize';
import Guard from '../utils/guard.util.js';
import z from 'zod';

/**
 * Builder that fetch the user informations from the database.
 * @param {Number} id_user id of the user.
 * @param {String} mail address of the user.
 * @returns {User}
 */
export const get = async function (props) {
  const schema = z.object({
    id_user: z.number().positive().optional(),
    mail: z.email("The mail address is not properly formated.").optional()
  });
  const data = Guard.validateProps(schema, props);
  if (props.id_user === undefined && props.mail === undefined) throw new MissingArgumentError("Either mail or id_user must be present.")
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
  if (data.id_user !== undefined) options.where = { id_user: data.id_user };
  else options.where = { mail: data.mail };
  return await dbManager.models.USERS.findOne(options)
    .then((r) => {
      if (r == null) throw new DBObjectNotFound('The user could not be found.');
      return new User({
        ...r,
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
 * @param {String} role role we want the list of user.
 * @returns {Array<User>}
 */
export const list = async function (props) {
  try {
    const schema = z.object({
      role: z.enum(["ETUDIANT", "PROFESSEUR", "ADMINISTRATEUR"])
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      include: {
        model: dbManager.models.USER_ROLE,
        required: true,
        where: { label: data.role },
      },
    };
    return await dbManager.models.USERS.findAll(options)
      .then(r => r.map(user => new User({ ...user, role: user.USER_ROLE.label })));
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Function used to fetch all the users in the array of ids.
 * @param {Array<Number>} ids ids of all the users we want to retrieve.
 * @returns {Array<User>}
 */
export const get_list = async function (props) {
  try {
    const schema = z.object({
      ids: z.array(z.number().positive())
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      where: {
        id_user: {
          [Op.in]: data.ids,
        },
      },
      include: {
        model: dbManager.models.USER_ROLE,
        required: true,
      },
    };
    return await dbManager.models.USERS.findAll(options)
      .then(r => r.map(user => new User({ ...user, role: user.USER_ROLE.label })));
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that update the user's password in the database.
 * @param {Number} id_user id of the user
 * @param {String} hashed_password hashed (by bcrypt) password to put to user infos.
 * @returns {User}
 */
export const update_password = async function (props) {
  try {
    const schema = z.object({
      id_user: z.number().positive(),
      hashed_password: z.string()
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      where: {
        id_user: data.id_user,
      },
    };
    const user = await dbManager.models.USERS.findOne(options);
    if (user == null) throw new DBObjectNotFound('The user could not be found.');

    const opt_update = {
      pwd: data.hashed_password,
    };
    const opt_condition = {
      where: {
        id_password: user.id_password,
      },
    };

    return await dbManager.models.PASSWORD.update(opt_update, opt_condition)
      .then(() => "The user's password has been changed.");
  }
  catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  };
};

/**
 * Builder that creates a new User object in the database.
 * @param {String} firstname firstname of the new user.
 * @param {String} lastname lastname of the new user.
 * @param {String} mail mail of the new user.
 * @param {Number} id_role id of the role to attribute to the new user.
 * @param {String} hashed_password hashed_password of the new user.
 * @returns {User}
 */
export const create = async function (props) {
  try {
    const schema = z.object({
      firstname: z.string().min(1),
      lastname: z.string().min(1),
      mail: z.email('Invalid email address'),
      id_role: z.number().positive(),
      hashed_password: z.string()
    });
    const data = Guard.validateProps(schema, props);
    const pwd = await dbManager.models.PASSWORD.create({ pwd: data.hashed_password });
    const options = {
      firstname: data.firstname,
      lastname: data.lastname,
      mail: data.mail,
      id_role: data.id_role,
      id_password: pwd.id_password,
    };
    return await dbManager.models.USERS.create(options)
    .then( r => new User({...r}));
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
