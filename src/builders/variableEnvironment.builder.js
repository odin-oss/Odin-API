import VariableEnvironment from '../objects/Variable_environment.js';
import dbManager from '../config/db.config.js';

/**
 * Function that get the list of all the varenvs in database.
 * @returns {Array<VariableEnvironment>}
 */
export const list = async function () {
  return await dbManager.models.VARIABLE_ENVIRONMENT.findAll()
    .then((varenvs) =>
      varenvs.map((varenv) => new VariableEnvironment(varenv.dataValues))
    )
    .catch(dbManager.sequelizeErrorManagement);
};
