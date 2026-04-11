import z from 'zod';
import dbManager from '../config/db.config.js';
import Guard from '../utils/guard.util.js';

/**
 * Create a token in the whitelist in the database
 * @param {String} uuid UUID of the token
 * @param {String} hash_token Hash of the token
 * @returns { boolean }
 */
export const create = async function (props) {
  try {
    const schema = z.object({
      uuid: z.string().min(2),
      hash_token: z.string().min(2),
    });
    const data = Guard.validateProps(schema, props);
    // We find the state from different parameters.
    await dbManager.models.WHITELIST.destroy({
      where: { uuid: data.uuid },
    });

    // We prepare the creation of the agent
    const options = {
      uuid: data.uuid,
      token: data.hash_token,
    };
    return await dbManager.models.WHITELIST.create(options).then(() => true);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Get a token from the whitelist in the database
 * @param {String} uuid UUID of the token
 * @returns {String} Hash of the token
 */
export const get = async function (props) {
  try {
    const schema = z.object({
      uuid: z.string().min(2),
    });
    const data = Guard.validateProps(schema, props);
    return await dbManager.models.WHITELIST.findOne({
      where: { uuid: data.uuid },
    }).then((r) => r.token);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
