import dbManager from '../config/db.config.js';
import {
  DBObjectAlreadyExists,
  DBObjectNotFound,
  MissingArgumentError,
} from '../utils/errors.util.js';
import { Interface } from '../objects/Interface.js';
import Guard from '../utils/guard.util.js';
import z from 'zod';
import VariableEnvironment from '../objects/Variable_environment.js';
import Port from '../objects/Port.js';
import PortType from '../objects/Port_type.js';
import NodeSelector from '../objects/NodeSelector.js';
import Argument from '../objects/Argument.js';

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
  };
  return await dbManager.models.INTERFACE.findOne(options)
    .then((r) => {
      if (r == null)
        throw new DBObjectNotFound('The interface could not be found.');
      return new Interface({
        ...r.dataValues,
        id_type: r.IMAGE_TYPE.id_type,
        label_type_image: r.IMAGE_TYPE.label,
        args: r.INTERFACE_HAS_ARGUMENTs.sort(
          (a, b) => a.id_argument - b.id_argument
        ).map((arg) => new Argument({ ...arg.ARGUMENT.dataValues })),
        node_selectors: r.INTERFACE_HAS_NODE_SELECTORs.map(
          (ins) => new NodeSelector({ ...ins.NODE_SELECTOR.dataValues })
        ),
        ports: r.INTERFACE_HAS_PORTs.map(
          (ihp) =>
            new Port({
              ...ihp.dataValues,
              port_type: new PortType({ ...ihp.PORT_TYPE.dataValues }),
            })
        ),
        envs: r.INTERFACE_HAS_VARIABLEs.map(
          (ihv) =>
            new VariableEnvironment({ ...ihv.VARIABLE_ENVIRONMENT.dataValues })
        ),
      });
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};

/**
 * Builder that fetchs the whole list of interfaces.
 * @returns {Array<Interface>}
 */
export const list = async function () {
  return await dbManager.models.INTERFACE.findAll({
    include: [
      {
        model: dbManager.models.INTERFACE_HAS_ARGUMENT,
        separate: true,
        order: [['id_argument', 'ASC']],
        include: [
          {
            model: dbManager.models.ARGUMENT,
          },
        ],
      },
      {
        model: dbManager.models.INTERFACE_HAS_VARIABLE,
        separate: true,
        order: [['id_variable_environment', 'ASC']],
        include: [
          {
            model: dbManager.models.VARIABLE_ENVIRONMENT,
          },
        ],
      },
      {
        model: dbManager.models.INTERFACE_HAS_NODE_SELECTOR,
        separate: true,
        order: [['id_node_selector', 'ASC']],
        include: [
          {
            model: dbManager.models.NODE_SELECTOR,
          },
        ],
      },
      {
        model: dbManager.models.INTERFACE_HAS_PORT,
        separate: true,
        order: [['port', 'ASC']],
        include: [
          {
            model: dbManager.models.PORT_TYPE,
          },
        ],
      },
      {
        model: dbManager.models.IMAGE_TYPE,
        required: true,
      },
    ],
  }).then((result) =>
    result.map(
      (inter) =>
        new Interface({
          ...inter.dataValues,
          id_type: inter.IMAGE_TYPE.id_type,
          label_type_image: inter.IMAGE_TYPE.label,
          argument: inter.INTERFACE_HAS_ARGUMENTs.sort(
            (a, b) => a.id_argument - b.id_argument
          ).map((arg) => new Argument({ ...arg.ARGUMENT.dataValues })),
          node_selectors: inter.INTERFACE_HAS_NODE_SELECTORs.map(
            (ins) => new NodeSelector({ ...ins.NODE_SELECTOR.dataValues })
          ),
          ports: inter.INTERFACE_HAS_PORTs.map(
            (ihp) =>
              new Port({
                ...ihp.dataValues,
                port_type: new PortType({ ...ihp.PORT_TYPE.dataValues }),
              })
          ),
          variable_environments: inter.INTERFACE_HAS_VARIABLEs.map(
            (ihv) =>
              new VariableEnvironment({
                ...ihv.VARIABLE_ENVIRONMENT.dataValues,
              })
          ),
        })
    )
  );
};

/**
 * Builder that creates a new interface in the database.
 * @param {String} label label of the new Interface.
 * @param {String} registry_link registry_link of the container used by the new Interface.
 * @param {String} exec_command exec_command that will be used by new Interface.
 * @param {String} service_command command or script to be used on start of the container.
 * @param {Number} id_type type of image to be used.
 * @param {Boolean} need_compute_gpu do we need to attach a GPU for computing purpose.
 * @param {Boolean} need_graphical_rendering_gpu do we need to attach a GPU for graphical rendering purpose.
 * @param {String} cpu_request dedicated CPU to set on this new Interface.
 * @param {String} cpu_limit limit of CPU that this new Interface can take.
 * @param {String} ram_request dedicated RAM to set on this new Interface.
 * @param {String} ram_limit limit of RAM that this new Interface can take.
 * @param {String} egress_bandwidth authorized egress bandwidth on this interface Interface.
 * @param {String} ingress_bandwidth authorized ingress bandwidth on this interface Interface.
 * @param {Number} readiness_probe_initial_delay how many seconds before the first execution of the Readiness Probe script.
 * @param {Number} readiness_probe_period how many seconds between two executions of the Readiness Probe script.
 * @param {Number} liveness_probe_initial_delay how many seconds before the first execution of the Liveness Probe script.
 * @param {Number} liveness_probe_period how many seconds between two executions of the Liveness Probe script.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Interface}
 */
export const create = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      label: z.preprocess(
        (val) =>
          String(val)
            .replace(/[^a-zA-Z0-9-]/g, '')
            .toLowerCase(),
        z.string().min(2).max(255)
      ),
      registry_link: z.string().min(2).max(255),
      exec_command: z.string().min(2).max(255),
      service_command: z.string().min(2).max(255),
      id_type: z.coerce.number().int().positive(),
      need_compute_gpu: z
        .preprocess((val) => String(val).toLocaleLowerCase(), z.string())
        .transform((val) => val === 'true')
        .default(false),
      need_graphical_rendering_gpu: z
        .preprocess((val) => String(val).toLocaleLowerCase(), z.string())
        .transform((val) => val === 'true')
        .default(false),
      cpu_request: z.union([
        z.number().int({ message: 'The CPU must be a string or an integer.' }),
        z
          .string()
          .regex(/^\d+m?$/, {
            message:
              'The string value of the CPU must be xx or xxm, xx being the integer.',
          }),
      ]),
      ram_request: z
        .string({ invalid_type_error: 'The RAM value must be a string.' })
        .regex(/^\d+(Gi|Mi)$/, {
          message:
            'The RAM value must be as xxGi or xxMi, xx being the integer.',
        }),
      cpu_limit: z.union([
        z.number().int({ message: 'The CPU must be a string or an integer.' }),
        z
          .string()
          .regex(/^\d+m?$/, {
            message:
              'The string value of the CPU must be xx or xxm, xx being the integer.',
          }),
      ]),
      ram_limit: z
        .string({ invalid_type_error: 'The RAM value must be a string.' })
        .regex(/^\d+(Gi|Mi)$/, {
          message:
            'The RAM value must be as xxGi or xxMi, xx being the integer.',
        }),
      readiness_probe_initial_delay: z.coerce.number().int().positive(),
      readiness_probe_period: z.coerce.number().int().positive(),
      liveness_probe_initial_delay: z.coerce.number().int().positive(),
      liveness_probe_period: z.coerce.number().int().positive(),
      egress_bandwidth: z
        .string({ invalid_type_error: 'The bandwidth must be sent in string.' })
        .regex(/^\d+[MG]$/, {
          message:
            'The bandwidth should be like xxM or xxG, xx being your number value.',
        }),
      ingress_bandwidth: z
        .string({ invalid_type_error: 'The bandwidth must be sent in string.' })
        .regex(/^\d+[MG]$/, {
          message:
            'The bandwidth should be like xxM or xxG, xx being your number value.',
        }),
    });
    const data = Guard.validateProps(schema, props);
    const created = await dbManager.models.INTERFACE.create(data);
    return await fns.get(created);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
/**
 * Builder that detach all the args from an interface and then add all the new.
 * @param {Array<String>} args new args to set.
 * @param {Number} id_interface id of the interface to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Interface}
 */
export const update_args = async function (props) {
  try {
    const schema = z.object({
      id_interface: z.coerce.number().int().positive(),
      args: z.array(
        z.string({ invalid_type_error: 'Each argument must be a string.' }),
        { invalid_type_error: 'Args should be an array of string.' }
      ),
    });
    const data = Guard.validateProps(schema, props);

    // Checking that the interface exists
    const inter = await dbManager.models.INTERFACE.findByPk(data.id_interface);
    if (!inter) throw new DBObjectNotFound(`Interface does not exist.`);

    // Empty the actual args
    await dbManager.models.INTERFACE_HAS_ARGUMENT.destroy({
      where: { id_interface: data.id_interface },
    });
    const promises = [];
    for (const arg of data.args) {
      // Is the argument existing ?
      const existing = await dbManager.models.ARGUMENT.findOne({
        where: {
          value: arg,
        },
      });
      if (existing)
        promises.push(
          dbManager.models.INTERFACE_HAS_ARGUMENT.create({
            id_interface: data.id_interface,
            id_argument: existing.id_argument,
          })
        );
      else {
        const creating = await dbManager.models.ARGUMENT.create({
          value: arg,
        });
        promises.push(
          dbManager.models.INTERFACE_HAS_ARGUMENT.create({
            id_interface: data.id_interface,
            id_argument: creating.id_argument,
          })
        );
      }
    }
    await Promise.all(promises);
    return await get(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that detach all the node_selectors from an interface and then add all the new.
 * @param {Array<node_selectors>} node_selectors new node_selectors to set.
 * @param {Number} id_interface id of the interface to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Interface}
 */
export const update_nodeselectors = async function (props) {
  try {
    const schema = z.object({
      id_interface: z.coerce.number().int().positive(),
      node_selectors: z.array(
        z.coerce
          .number()
          .int()
          .positive({ message: 'Each ID must be a positive integer.' }),
        { invalid_type_error: 'Arrays of ids should be an array.' }
      ),
    });
    const data = Guard.validateProps(schema, props);
    // Checking that the interface exists
    const inter = await dbManager.models.INTERFACE.findByPk(data.id_interface);
    if (!inter) throw new DBObjectNotFound(`Interface does not exact.`);

    //Empty the associated node_selector
    await dbManager.models.INTERFACE_HAS_NODE_SELECTOR.destroy({
      where: { id_interface: data.id_interface },
    });
    return await attach_nodeselectors({
      ...data,
      ids_node_selector: data.node_selectors,
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
/**
 * Builder that detach all the ports from an interface and then add all the new.
 * @param {Array<Port>} ports new ports to set.
 * @param {Number} id_interface id of the interface to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Interface}
 */
export const update_ports = async function (props) {
  try {
    const schema = z.object({
      id_interface: z.coerce.number().int().positive(),
      ports: z.array(
        z.object(
          {
            port: z.coerce.number().int().positive(),
            id_port_type: z.coerce.number().int().positive(),
            icon: z.string().min(2).max(255),
            label: z.string().min(2).max(255),
            display_name: z.string().min(2).max(255),
          },
          {
            invalid_type_error:
              'Each port must be an object with the required keys.',
          }
        ),
        { invalid_type_error: 'Ports should be an array of port objects' }
      ),
    });
    const data = Guard.validateProps(schema, props);

    // Checking that the interface exists
    const inter = await dbManager.models.INTERFACE.findByPk(data.id_interface);
    if (!inter) throw new DBObjectNotFound(`Interface does not exist.`);

    //Empty the table
    await dbManager.models.INTERFACE_HAS_PORT.destroy({
      where: { id_interface: data.id_interface },
    });
    return await attach_ports(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
/**
 * Builder that detach all the envs from an interface and then add all the new.
 * @param {Array<envs>} envs new envs to set.
 * @param {Number} id_interface id of the interface to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Interface}
 */
export const update_envs = async function (props) {
  try {
    const schema = z.object({
      id_interface: z.coerce.number().int().positive(),
      envs: z.array(
        z.union(
          [
            z.object({
              id_variable_environment: z.coerce.number().int().positive(),
            }),
            z.object({ key: z.string().min(1), value: z.string() }),
          ],
          {
            errorMap: () => ({
              message:
                'The env object should have: key and value OR id_variable_environment.',
            }),
          }
        ),
        { invalid_type_error: 'Envs should be an array.' }
      ),
    });
    const data = Guard.validateProps(schema, props);
    // Getting the existing Interface
    const inter = await dbManager.models.INTERFACE.findByPk(data.id_interface);
    if (!inter) throw new DBObjectNotFound(`Interface not found in database.`);

    // Removing env var from interface in database
    await dbManager.models.INTERFACE_HAS_VARIABLE.destroy({
      where: { id_interface: data.id_interface },
    });
    return await attach_envs(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
/**
 * Builder that updates the infos of the interface.
 * @param {String} label label of the new Interface.
 * @param {String} registry_link registry_link of the container used by the new Interface.
 * @param {String} exec_command exec_command that will be used by new Interface.
 * @param {String} service_command command or script to be used on start of the container.
 * @param {Number} id_type type of image to be used.
 * @param {Boolean} need_compute_gpu do we need to attach a GPU for computing purpose.
 * @param {Boolean} need_graphical_rendering_gpu do we need to attach a GPU for graphical rendering purpose.
 * @param {String} cpu_request dedicated CPU to set on this new Interface.
 * @param {String} cpu_limit limit of CPU that this new Interface can take.
 * @param {String} ram_request dedicated RAM to set on this new Interface.
 * @param {String} ram_limit limit of RAM that this new Interface can take.
 * @param {String} egress_bandwidth authorized egress bandwidth on this interface Interface.
 * @param {String} ingress_bandwidth authorized ingress bandwidth on this interface Interface.
 * @param {Number} readiness_probe_initial_delay how many seconds before the first execution of the Readiness Probe script.
 * @param {Number} readiness_probe_period how many seconds between two executions of the Readiness Probe script.
 * @param {Number} liveness_probe_initial_delay how many seconds before the first execution of the Liveness Probe script.
 * @param {Number} liveness_probe_period how many seconds between two executions of the Liveness Probe script.
 * @param {Number} id_interface id of the interface to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Interface}
 */
export const update = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      id_interface: z.coerce.number().int().positive(),
      label: z
        .preprocess(
          (val) =>
            String(val)
              .replace(/[^a-zA-Z0-9-]/g, '')
              .toLowerCase(),
          z.string().min(2).max(255)
        )
        .optional(),
      registry_link: z.string().min(2).max(255).optional(),
      exec_command: z.string().min(2).max(255).optional(),
      service_command: z.string().min(2).max(255).optional(),
      id_type: z.coerce.number().int().positive().optional(),
      need_compute_gpu: z
        .preprocess((val) => String(val).toLocaleLowerCase(), z.string())
        .transform((val) => val === 'true')
        .optional(),
      need_graphical_rendering_gpu: z
        .preprocess((val) => String(val).toLocaleLowerCase(), z.string())
        .transform((val) => val === 'true')
        .optional(),
      cpu_request: z
        .union([
          z
            .number()
            .int({ message: 'The CPU must be a string or an integer.' }),
          z
            .string()
            .regex(/^\d+m?$/, {
              message:
                'The string value of the CPU must be xx or xxm, xx being the integer.',
            }),
        ])
        .optional(),
      ram_request: z
        .string({ invalid_type_error: 'The RAM value must be a string.' })
        .regex(/^\d+(Gi|Mi)$/, {
          message:
            'The RAM value must be as xxGi or xxMi, xx being the integer.',
        })
        .optional(),
      cpu_limit: z
        .union([
          z
            .number()
            .int({ message: 'The CPU must be a string or an integer.' }),
          z
            .string()
            .regex(/^\d+m?$/, {
              message:
                'The string value of the CPU must be xx or xxm, xx being the integer.',
            }),
        ])
        .optional(),
      ram_limit: z
        .string({ invalid_type_error: 'The RAM value must be a string.' })
        .regex(/^\d+(Gi|Mi)$/, {
          message:
            'The RAM value must be as xxGi or xxMi, xx being the integer.',
        })
        .optional(),
      readiness_probe_initial_delay: z.coerce
        .number()
        .int()
        .positive()
        .optional(),
      readiness_probe_period: z.coerce.number().int().positive().optional(),
      liveness_probe_initial_delay: z.coerce
        .number()
        .int()
        .positive()
        .optional(),
      liveness_probe_period: z.coerce.number().int().positive().optional(),
      egress_bandwidth: z
        .string({ invalid_type_error: 'The bandwidth must be sent in string.' })
        .regex(/^\d+[MG]$/, {
          message:
            'The bandwidth should be like xxM or xxG, xx being your number value.',
        })
        .optional(),
      ingress_bandwidth: z
        .string({ invalid_type_error: 'The bandwidth must be sent in string.' })
        .regex(/^\d+[MG]$/, {
          message:
            'The bandwidth should be like xxM or xxG, xx being your number value.',
        })
        .optional(),
    });
    const data = Guard.validateProps(schema, props);
    const inter = await dbManager.models.INTERFACE.findByPk(data.id_interface);
    if (!inter)
      throw new DBObjectNotFound(
        `Interface with ID ${data.id_interface} not found`
      );
    // Identification of attributes to update
    const { id_interface, ...updates } = data;
    await dbManager.models.INTERFACE.update(updates, {
      where: { id_interface },
    });
    return await fns.get(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that attributes one or multiple node selector to interface.
 * @param {Array<Number>} ids_node_selector array of ids.
 * @param {Number} id_interface id of the interface to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Interface}
 */
export const attach_nodeselectors = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      id_interface: z.coerce.number().int().positive(),
      ids_node_selector: z.array(
        z.coerce
          .number()
          .int()
          .positive({ message: 'Each ID must be a positive integer.' }),
        { invalid_type_error: 'Arrays of ids should be an array.' }
      ),
    });
    const data = Guard.validateProps(schema, props);
    // Checking that the interface exists
    const inter = await dbManager.models.INTERFACE.findByPk(data.id_interface);
    if (!inter) throw new DBObjectNotFound(`Interface does not exist.`);

    // Dealing with attribution
    const promises = [];
    for (const id of data.ids_node_selector) {
      const options = {
        id_interface: data.id_interface,
        id_node_selector: id,
      };
      if (
        await dbManager.models.INTERFACE_HAS_NODE_SELECTOR.findOne({
          where: {
            id_interface: data.id_interface,
            id_node_selector: id,
          },
        })
      )
        throw new DBObjectAlreadyExists(
          'The node_selector ' + id + ' is already attached.'
        );
      promises.push(
        dbManager.models.INTERFACE_HAS_NODE_SELECTOR.create(options)
      );
    }
    await Promise.all(promises);
    return await fns.get(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that attributes one or multiple port to interface.
 * @param {Array<Port>} ports new ports to set.
 * @param {Number} id_interface id of the interface to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Interface}
 */
export const attach_ports = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      id_interface: z.coerce.number().int().positive(),
      ports: z.array(
        z.object(
          {
            port: z.coerce.number().int().positive(),
            id_port_type: z.coerce.number().int().positive(),
            icon: z.string().min(2).max(255),
            label: z.string().min(2).max(255),
            display_name: z.string().min(2).max(255),
          },
          {
            invalid_type_error:
              'Each port must be an object with the required keys.',
          }
        ),
        { invalid_type_error: 'Ports should be an array of port objects' }
      ),
    });
    const data = Guard.validateProps(schema, props);
    // Checking that the interface exists
    const inter = await dbManager.models.INTERFACE.findByPk(data.id_interface);
    if (!inter) throw new DBObjectNotFound(`Interface does not exist.`);

    const promises = [];
    for (const port of data.ports) {
      promises.push(
        dbManager.models.INTERFACE_HAS_PORT.create({
          ...port,
          id_interface: data.id_interface,
        })
      );
    }
    await Promise.all(promises);
    return await fns.get(data);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
/**
 * Builder that attributes one or multiple env var to interface.
 * @param {Array<envs>} envs new envs to set.
 * @param {Number} id_interface id of the interface to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Interface}
 */
export const attach_envs = async function (props, fns = { get }) {
  try {
    const schema = z.object({
      id_interface: z.coerce.number().int().positive(),
      envs: z.array(
        z.union(
          [
            z.object({
              id_variable_environment: z.coerce.number().int().positive(),
            }),
            z.object({ key: z.string().min(1), value: z.string() }),
          ],
          {
            errorMap: () => ({
              message:
                'The env object should have: key and value OR id_variable_environment.',
            }),
          }
        ),
        { invalid_type_error: 'Envs should be an array.' }
      ),
    });
    const data = Guard.validateProps(schema, props);

    // Checking that the interface exists
    const inter = await dbManager.models.INTERFACE.findByPk(data.id_interface);
    if (!inter) throw new DBObjectNotFound(`The interface does not exist.`);

    // Creating VarEnvs
    const promises = [];
    for (const { id_variable_environment, key, value } of data.envs) {
      let variableId = id_variable_environment;
      if (!variableId && (!key || !value))
        throw new MissingArgumentError(
          'Each env must have either "id_variable_environment" or both "key" and "value".'
        );

      let opt;
      if (!variableId) {
        opt = { key, value };
        const variable =
          await dbManager.models.VARIABLE_ENVIRONMENT.create(opt);
        variableId = variable.id_variable_environment;
      }
      if (
        await dbManager.models.INTERFACE_HAS_VARIABLE.findOne({
          where: {
            id_interface: data.id_interface,
            id_variable_environment: variableId,
          },
        })
      )
        throw new DBObjectAlreadyExists(
          'The env ' + variableId + ' is already attached.'
        );
      opt = {
        id_interface: data.id_interface,
        id_variable_environment: variableId,
      };
      promises.push(dbManager.models.INTERFACE_HAS_VARIABLE.create(opt));
    }
    await Promise.all(promises);
    return await fns.get(data);
  } catch (err) {
    console.log(err);
    throw dbManager.sequelizeErrorManagement(err);
  }
};
