import z from 'zod';
import dbManager from '../config/db.config.js';
import { Datacenter } from '../objects/Datacenter.js';
import { DBObjectNotFound } from '../utils/errors.util.js';
import Guard from '../utils/guard.util.js';

/**
 * Builder that fetchs all the dcs in the database.
 * @returns {Array<Datacenter>}
 */
export const list = async function () {
  return await dbManager.models.DATACENTER.findAll()
    .then((dcs) => dcs.map((dc) => new Datacenter({ ...dc.dataValues })))
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};

/**
 * Builder that gets the specific datacenter in database.
 * @param {Number} id_datacenter id of the datacenter to get.*
 * @returns {Datacenter}
 */
export const get = async function (props) {
  const schema = z.object({
    id_datacenter: z.number().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await dbManager.models.DATACENTER.findOne({ where: { ...data } })
    .then((r) => {
      if (r == null)
        throw new DBObjectNotFound('The datacenter could not be found.');
      return new Datacenter({ ...r.dataValues });
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};
