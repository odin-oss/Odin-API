import Argument from '../objects/Argument.js';
import db from '../config/db.config.js';

/**
 * List all the arguments in the database.
 * @returns {Array<Argument>}
 */
export const list = async function () {
  try {
    return await db.models.ARGUMENT.findAll().then((args) =>
      args.map((arg) => new Argument(arg))
    );
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};
