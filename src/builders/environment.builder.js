import z from 'zod';
import dbManager from '../config/db.config.js';
import { Environment } from '../objects/Environment.js';
import { Interface } from '../objects/Interface.js';
import Guard from '../utils/guard.util.js';
import { DBObjectAlreadyExists, DBObjectNotFound } from '../utils/errors.util.js';

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
          ...env.INTERFACE.dataValues,
          label_type_image: env.INTERFACE.IMAGE_TYPE.label,
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
              ...env.ENVIRONMENT.dataValues,
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
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};

/**
 * Builder that fetch all the informations of one environment.
 * @param {Number} id_environment id of the environment.
 * @returns {Environment}
 */
export const get = async function (props) {
  try {
    const schema = z.object({
      id_environment: z.coerce.number().int().positive()
    });
    const data = Guard.validateProps(schema, props);
    return await dbManager.models.ENVIRONMENT.findOne({
      where: {
        id_environment: data.id_environment,
      },
      include: [
        {
          model: dbManager.models.ENVIRONMENT_HAS_INTERFACE,
          include: [
            {
              model: dbManager.models.INTERFACE,
              include: [
                {
                  model: dbManager.models.IMAGE_TYPE,
                  required: true,
                },
                {
                  model: dbManager.models.INTERFACE_HAS_ARGUMENT,
                  separate: true,
                  include: [
                    {
                      model: dbManager.models.ARGUMENT,
                      order: [['id_argument', 'DESC']],
                    },
                  ],
                },
                {
                  model: dbManager.models.INTERFACE_HAS_NODE_SELECTOR,
                  separate: true,
                  include: [
                    {
                      model: dbManager.models.NODE_SELECTOR,
                    },
                  ],
                },
                {
                  model: dbManager.models.INTERFACE_HAS_PORT,
                  separate: true,
                  include: [
                    {
                      model: dbManager.models.PORT_TYPE,
                    },
                  ],
                },
                {
                  model: dbManager.models.INTERFACE_HAS_VARIABLE,
                  separate: true,
                  include: [
                    {
                      model: dbManager.models.VARIABLE_ENVIRONMENT,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [['id_environment', 'ASC']],
    }).then((env) => {
      if (env == null)
        throw new DBObjectNotFound('The environment does not exist.');
      return new Environment({
        ...env.dataValues,
        interfaces: env.ENVIRONMENT_HAS_INTERFACEs.map((inter) => new Interface({
          ...inter.INTERFACE.dataValues,
          label: inter.label,
          id_type: inter.INTERFACE.IMAGE_TYPE.id_type,
          label_type_image: inter.INTERFACE.IMAGE_TYPE.label,
          args: inter.INTERFACE.INTERFACE_HAS_ARGUMENTs.sort(
            (a, b) => a.id_argument - b.id_argument
          ).map((arg) => ({
            id_argument: arg.id_argument,
            value: arg.ARGUMENT.value,
          })),
          node_selectors: inter.INTERFACE.INTERFACE_HAS_NODE_SELECTORs.map(
            (ins) => ({
              id_node_selector: ins.id_node_selector,
              key: ins.NODE_SELECTOR.key,
              value: ins.NODE_SELECTOR.value,
            })
          ),
          ports: inter.INTERFACE.INTERFACE_HAS_PORTs.map((ihp) => ({
            id_port_type: ihp.id_port_type,
            port: ihp.port,
            label: ihp.label,
            port_type: ihp.PORT_TYPE.label,
            display_name: ihp.display_name,
            icon: ihp.icon,
          })),
          envs: inter.INTERFACE.INTERFACE_HAS_VARIABLEs.map((ihv) => ({
            id_variable_environment: ihv.id_variable_environment,
            key: ihv.VARIABLE_ENVIRONMENT.key,
            value: ihv.VARIABLE_ENVIRONMENT.value,
          })),
        })
        )

      });
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Creating a new Environment in database.
 * @param {String} label label of the new Environment to be created.
 * @param {String} icon icon of the new Environment to be created.
 * @returns {Environment}
 */
export const create = async function (props) {
  try {
    const schema = z.object({
      label: z.preprocess((val) => String(val).replace(/[^a-zA-Z0-9-]/g, '').toLowerCase(), z.string().min(2)),
      icon: z.string().min(2)
    });
    const data = Guard.validateProps(schema, props);
    const env = await dbManager.models.ENVIRONMENT.create(data);
    return await dbManager.models.ENVIRONMENT.findOne({ where: { id_environment: env.id_environment } })
      .then((result) => new Environment(result));
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Attaching a new Interface to Environment in database.
 * @param {String} label label of the new Environment to be created.
 * @param {String} id_environment id of the environment to attach the interface to.
 * @param {String} id_interface id of the interface to attach.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const attach_interface = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      label: z.preprocess((val) => String(val).replace(/[^a-zA-Z0-9-]/g, '').toLowerCase(), z.string().min(2)),
      id_environment: z.coerce.number().int().positive(),
      id_interface: z.coerce.number().int().positive()
    });
    const data = Guard.validateProps(schema, props);
    const environment = await dbManager.models.ENVIRONMENT.findByPk(
      data.id_environment,
      {
        include: [
          {
            model: dbManager.models.ENVIRONMENT_HAS_INTERFACE,
            include: [{ model: dbManager.models.INTERFACE }],
          },
        ],
      }
    );
    if (!environment)
      throw new DBObjectNotFound(`The environment does not exist.`);

    // Checking if the interface is already linked to environment
    const existingLink = await dbManager.models.ENVIRONMENT_HAS_INTERFACE.findOne({
      where: {
        id_environment: data.id_environment,
        id_interface: data.id_interface,
      },
    });
    if (existingLink)
      throw new DBObjectAlreadyExists(
        `The interface is already attached to this environment.`
      );

    // Attaching the Interface to the environment
    await dbManager.models.ENVIRONMENT_HAS_INTERFACE.create({
      id_environment: data.id_environment,
      id_interface: data.id_interface,
      label: data.label
    });

    // Sending the whole Environment
    return await fns.get(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Detaching an Interface from an Environment in database.
 * @param {String} label label of the new Environment to be created.
 * @param {String} id_environment id of the environment to attach the interface to.
 * @param {String} id_interface id of the interface to attach.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const detach_interface = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      label: z.preprocess((val) => String(val).replace(/[^a-zA-Z0-9-]/g, '').toLowerCase(), z.string().min(2)),
      id_environment: z.coerce.number().int().positive(),
      id_interface: z.coerce.number().int().positive()
    });
    const data = Guard.validateProps(schema, props);
    const environment = await dbManager.models.ENVIRONMENT.findByPk(
      data.id_environment,
      {
        include: [
          {
            model: dbManager.models.ENVIRONMENT_HAS_INTERFACE,
            include: [{ model: dbManager.models.INTERFACE }],
          },
        ],
      }
    );
    if (!environment)
      throw new DBObjectNotFound(`The environment does not exist.`);

    // Checking if the interface is already detached from environment
    const existingLink = await dbManager.models.ENVIRONMENT_HAS_INTERFACE.findOne({
      where: {
        id_environment: data.id_environment,
        id_interface: data.id_interface,
      },
    });
    if (!existingLink)
      throw new DBObjectAlreadyExists(
        `The interface is already detached to this environment.`
      );

    // Detaching the interface from environment
    await dbManager.models.ENVIRONMENT_HAS_INTERFACE.destroy({
      where: {
        id_environment: data.id_environment,
        id_interface: data.id_interface,
      },
    });
    return await fns.get(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};


/**
 * Updating icon & label of environment in database.
 * @param {String} label label of the new Environment to be put.
 * @param {String} icon icon of the new Environment to be put.
 * @param {Number} id_environment id of the environment to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const update = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      label: z.preprocess((val) => String(val).replace(/[^a-zA-Z0-9-]/g, '').toLowerCase(), z.string().min(2)),
      icon: z.preprocess((val) => String(val).replace(/[^a-zA-Z0-9-]/g, '').toLowerCase(), z.string().min(2)),
      id_environment: z.coerce.number().int().positive()
    });
    const data = Guard.validateProps(schema, props);
    // Getting the Environment from database
    const environment = await dbManager.models.ENVIRONMENT.findByPk(
      data.id_environment,
      {
        include: [
          {
            model: dbManager.models.ENVIRONMENT_HAS_INTERFACE,
            include: [{ model: dbManager.models.INTERFACE }],
          },
        ],
      }
    );
    if (!environment)
      throw new DBObjectNotFound(`The environment does not exist.`);

    // Updating the Environment
    await dbManager.models.ENVIRONMENT.update(
      { icon: data.icon, label: data.label },
      { where: { id_environment: data.id_environment } }
    );
    return await fns.get(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Updating the Label of an interface inside the environment, in db.
 * @param {String} label label of the interface to be put.
 * @param {Number} id_environment id of the environment to update.
 * @param {Number} id_interface id of the interface to update - on link with id_environment.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const update_interface = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      label: z.preprocess((val) => String(val).replace(/[^a-zA-Z0-9-]/g, '').toLowerCase(), z.string().min(2)),
      id_interface: z.coerce.number().int().positive(),
      id_environment: z.coerce.number().int().positive()
    });
    const data = Guard.validateProps(schema, props);
    const environment = await dbManager.models.ENVIRONMENT.findByPk(
      data.id_environment,
      {
        include: [
          {
            model: dbManager.models.ENVIRONMENT_HAS_INTERFACE,
            include: [{ model: dbManager.models.INTERFACE }],
          },
        ],
      }
    );
    if (!environment)
      throw new DBObjectNotFound(`The environment does not exist.`);
    await dbManager.models.ENVIRONMENT_HAS_INTERFACE.update(
      { label: data.label },
      {
        where: {
          id_environment: data.id_environment,
          id_interface: data.id_interface,
        },
      }
    );

    return await fns.get(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
/**
 * Deleting the Environment from the database.
 * @param {Number} id_environment id of the environment to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const del = async function (props, fns = { get }) {
    try {
        const schema = z.object({
          id_environment: z.coerce.number().int().positive()
        });
        const data = Guard.validateProps(schema, props);
        const environment = await fns.get(data);
        return await dbManager.models.ENVIRONMENT.destroy({
            where: { id_environment: data.id_environment },
        }).then(() => environment);
    } catch (err) {
        throw dbManager.sequelizeErrorManagement(err);
    }
};
