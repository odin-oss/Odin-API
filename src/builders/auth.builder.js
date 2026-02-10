import dbManager from '../config/db.config.js';
import { User } from '../objects/User.js';
import { DBObjectNotFound } from '../utils/errors.util.js';
import { UserRole } from '../objects/UserRole.js';
import Guard from '../utils/guard.util.js';
import z from 'zod';

/**
 * Builder that change the role of user.
 * @param {Number} id_user id of the user. 
 * @param {String} role new role of the user. 
 * @returns {User}
 */
export const update = async function (props) {
  try {
    const schema = z.object({
      id_user: z.number().positive(),
      role: z.string()
    });
    const data = Guard.validateProps(schema, props);
    const option = {
      where: { label: data.role },
    };
    const user_role = await dbManager.models.USER_ROLE.findOne(option)
      .then((r) => {
        if (r == null) throw new DBObjectNotFound('The role could not be found.');
        return r;
      });

    const values_update = { id_role: user_role.id_role };
    const options_update = {
      where: { id_user: data.id_user },
      returning: true,
    };
    return await dbManager.models.USERS.update(values_update, options_update)
      .then((r) => {
        if (r[0] === 0)
          throw new DBObjectNotFound('The user role could not be updated.');
        return new User({
          ...r[0],
          id_user: data.id_user,
          role: data.role,
          pwd: undefined,
        });
      });
  } catch (err) {
    throw dbManager.models.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that gets the UserRole from the id_role given.
 * @param {Number} id_role id of the role we want to get.
 * @returns {UserRole}
 */
export const role_by_id = async function (
  props
) {
  try {
    const schema = z.object({
      id_role: z.number().positive()
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      where: {
        id_role: data.id_role,
      },
    };
    return await dbManager.models.USER_ROLE.findOne(options)
      .then((r) => {
        if (!r) throw new DBObjectNotFound('The user role could not be found.');
        return new UserRole({
          ...r
        });
      });
  } catch (err) {
    throw dbManager.models.sequelizeErrorManagement(err);
  }
};
/**
 * Builder that gets the UserRole from the label given.
 * @param {String} label label we want the role from.
 * @returns {UserRole}
 */
export const role_by_label = async function (
  props
) {
  try {
    const schema = z.object({
      label: z.string()
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      where: {
        label: data.label,
      },
    };
    return await dbManager.models.USER_ROLE.findOne(options)
      .then((r) => {
        if (!r) throw new DBObjectNotFound('The user role could not be found.');
        return new UserRole({ ...r });
      });
  } catch (err) {
    throw dbManager.models.sequelizeErrorManagement(err);
  }
};
