import dbManager from '../config/db.config.js';
import { DBObjectNotFound } from '../utils/errors.service.js';
import { Interface } from '../objects/Interface.js';
import Guard from '../utils/guard.util.js';
import z from 'zod';

/**
 * Builder that fetchs the DB to get the interface.
 * @param {Number} id_interface id of the interface to get.
 * @returns {Interface}
 */
export const get = async function (props) {
  const schema = z.object({
    id_interface: z.number().positive(),
  });
  const data = Guard.validateProps(schema, props);
  const options = {
    where: { id_interface: data.id_interface },
    include: [
      {
        model: db.odin.IMAGE_TYPE,
        required: true,
      },
      {
        model: db.odin.INTERFACE_HAS_ARGUMENT,
        include: [
          {
            model: db.odin.ARGUMENT,
            order: [['id_argument', 'DESC']],
          },
        ],
      },
      {
        model: dbManager.models.INTERFACE_HAS_NODE_SELECTOR,
        include: [
          {
            model: dbManager.models.NODE_SELECTOR,
          },
        ],
      },
      {
        model: dbManager.models.INTERFACE_HAS_PORT,
        include: [
          {
            model: dbManager.models.PORT_TYPE,
          },
        ],
      },
      {
        model: dbManager.models.INTERFACE_HAS_VARIABLE,
        include: [
          {
            model: dbManager.models.VARIABLE_ENVIRONMENT,
          },
        ],
      },
    ],
  };
  return await dbManager.models.INTERFACE.findOne(options)
    .then((r) => {
      if (r == null)
        throw new DBObjectNotFound('The interface could not be found.');
      return new Interface({
        ...r,
        id_type: r.IMAGE_TYPE.id_type,
        label_type_image: r.IMAGE_TYPE.label,
        args: r.INTERFACE_HAS_ARGUMENTs.sort(
          (a, b) => a.id_argument - b.id_argument
        ).map((arg) => ({
          ...arg,
          value: arg.ARGUMENT.value,
        })),
        node_selectors: r.INTERFACE_HAS_NODE_SELECTORs.map((ins) => ({
          ...ins.NODE_SELECTOR,
          id_node_selector: ins.id_node_selector,
        })),
        ports: r.INTERFACE_HAS_PORTs.map((ihp) => ({
          ...ihp,
          port_type: ihp.PORT_TYPE.label,
        })),
        envs: r.INTERFACE_HAS_VARIABLEs.map((ihv) => ({
          ...ihv.VARIABLE_ENVIRONMENT,
          id_variable_environment: ihv.id_variable_environment,
        })),
      });
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};
