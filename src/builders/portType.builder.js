import dbManager from '../config/db.config.js';
import PortType from '../objects/Port_type.js';

/**
 * Listing all the PortType from Database.
 * @returns {Array<PortType>}
 */
export const list = async function () {
  return await dbManager.models.PORT_TYPE.findAll()
    .then((result) => result.map((r) => new PortType(r.dataValues)))
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};
