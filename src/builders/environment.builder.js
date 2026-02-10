import z from 'zod';
import dbManager from '../config/db.config.js';
import { Environment } from '../objects/Environment.js';
import { Interface } from '../objects/Interface.js';
import Guard from '../utils/guard.util.js';

/**
 * Builder that list all the environments in database.
 * @returns {Array<Environment>}
 */
export const list = async function () {
  const queryOptions = {
    include: [
      {
        model: dbManager.models.ENVIRONMENT,
        required: true,
      },
      {
        model: dbManager.models.INTERFACE,
        required: true,
        include: [
          {
            model: dbManager.models.IMAGE_TYPE,
            required: true,
          },
        ],
      },
    ],
  };
  return await dbManager.models.ENVIRONMENT_HAS_INTERFACE.findAll(queryOptions)
    .then((r) => {
      let result = [];
      for (let env of r) {
        const options = {
          ...env.INTERFACE,
          label: env.label,
          args: [],
          node_selectors: [],
          ports: [],
          envs: [],
        };
        if (
          result.filter((r) => r.id_environment === env.id_environment)
            .length === 0
        ) {
          result.push(
            new Environment({
              ...env,
              icon: env.ENVIRONMENT.icon,
              interfaces: [new Interface(options)],
            })
          );
        } else {
          result
            .filter((r) => r.id_environment === env.id_environment)[0]
            .interfaces.push(new Interface(options));
        }
      }
      return result;
    }).catch((err) => { throw dbManager.sequelizeErrorManagement(err) });
};

/**
 * Builder that fetch all the informations of one environment.
 * @param {Number} id_environment id of the environment.
 * @returns {Environment}
 */
export const get = async function (props) {
  try {
    const schema = z.object({
      id_environment: z.number().positive().optional()
    });
    const data = Guard.validateProps(schema, props);
    const queryOptions = {
      where: { id_environment: data.id_environment },
      include: [
        {
          model: dbManager.models.ENVIRONMENT,
          required: true,
        },
        {
          model: dbManager.models.INTERFACE,
          required: true,
          include: [
            {
              model: dbManager.models.IMAGE_TYPE,
              required: true,
            },
            {
              model: dbManager.models.INTERFACE_HAS_ARGUMENT,
              include: [
                {
                  model: dbManager.models.ARGUMENT,
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
        },
      ],
    };
    return await dbManager.models.ENVIRONMENT_HAS_INTERFACE.findAll(queryOptions)
    .then((r) => {
      let result;
      for (let env of r) {
        const options = {
          ...env.INTERFACE,
          label: env.label,
          args: env.INTERFACE.INTERFACE_HAS_ARGUMENTs.sort(
            (a, b) => a.id_argument - b.id_argument
          ).map((arg) => ({
            ...arg,
            value: arg.ARGUMENT.value,
          })),
          node_selectors: env.INTERFACE.INTERFACE_HAS_NODE_SELECTORs.map(
            (ins) => ({
              ...ins.NODE_SELECTOR,
              id_node_selector: ins.id_node_selector
            })
          ),
          ports: env.INTERFACE.INTERFACE_HAS_PORTs.map((ihp) => ({
            ...ihp,
            port_type: ihp.PORT_TYPE.label
          })),
          envs: env.INTERFACE.INTERFACE_HAS_VARIABLEs.map((ihv) => ({
            ...ihv.VARIABLE_ENVIRONMENT,
            id_variable_environment: ihv.id_variable_environment
          })),
        };
        if (result === undefined) {
          result = new Environment({
            ...env,
            icon: env.ENVIRONMENT.icon,
            interfaces: [new Interface(options)],
          });
        } else {
          result.interfaces.push(new Interface(options));
        }
      }
      return result;
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
