import dbManager from '../config/db.config.js';
import { Datacenter } from '../objects/Datacenter.js';
import {
  DBObjectNotFound,
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.util.js';
import Guard from '../utils/guard.util.js';

/**
 * Builder that fetchs all the dcs in the database.
 * @param {*} fns
 * @returns
 */
export const list = async function () {
  try {
    return await Promise.resolve(dbManager.models.DATACENTER.findAll()).then(
      (dcs) => {
        return dcs.map(
          (dc) =>
            new Datacenter({
              id_datacenter: dc.id_datacenter,
              label: dc.label,
              provider: dc.provider,
              city: dc.city,
            })
        );
      }
    );
  } catch (err) {
    throw dbManager.models.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that gets the specific datacenter in database.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const get = async function (
  props = {
    id_datacenter: undefined,
  }
) {
  const expected_props = {
    id_datacenter: undefined,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_id(props.id_datacenter))
    throw new ParameterMisformed(
      'The props.id_datacenter parameter is misformed.'
    );
  try {
    const datacenter_opt = {
      where: {
        id_datacenter: props.id_datacenter,
      },
    };
    return await Promise.resolve(
      dbManager.models.DATACENTER.findOne(datacenter_opt)
    ).then((r) => {
      if (r == null)
        throw new DBObjectNotFound('The datacenter could not be found.');
      return new Datacenter({
        id_datacenter: r.id_datacenter,
        label: r.label,
        provider: r.provider,
        city: r.city,
      });
    });
  } catch (err) {
    throw dbManager.models.sequelizeErrorManagement(err);
  }
};
