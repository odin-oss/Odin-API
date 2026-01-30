import db from '../config/db.config.js';
import { Environment } from '../objects/Environment.js';
import { Interface } from '../objects/Interface.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.service.js';
import * as parametres from '../../src/utils/parametres.service.js';

/**
 * Builder that list all the environments in database.
 * @param {*} fns
 * @returns
 */
export const list = async function () {
  try {
    const queryOptions = {
      include: [
        {
          model: db.cirrus.ENVIRONMENT,
          required: true,
        },
        {
          model: db.cirrus.INTERFACE,
          required: true,
          include: [
            {
              model: db.cirrus.IMAGE_TYPE,
              required: true,
            },
          ],
        },
      ],
    };
    return await Promise.resolve(
      db.cirrus.ENVIRONMENT_HAS_INTERFACE.findAll(queryOptions)
    ).then((r) => {
      let result = [];
      for (let env of r) {
        const options = {
          id_interface: env.INTERFACE.id_interface,
          label: env.label,
          default_label: env.INTERFACE.label,
          registry_link: env.INTERFACE.registry_link,
          exec_command: env.INTERFACE.exec_command,
          service_command: env.INTERFACE.service_command,
          privileged: env.INTERFACE.privileged,
          readiness_probe_initial_delay:
            env.INTERFACE.readiness_probe_initial_delay,
          liveness_probe_initial_delay:
            env.INTERFACE.liveness_probe_initial_delay,
          readiness_probe_period: env.INTERFACE.readiness_probe_period,
          liveness_probe_period: env.INTERFACE.liveness_probe_period,
          need_compute_gpu: env.INTERFACE.need_compute_gpu,
          need_graphical_rendering_gpu:
            env.INTERFACE.need_graphical_rendering_gpu,
          ram_limit: env.INTERFACE.ram_limit,
          ram_request: env.INTERFACE.ram_request,
          cpu_limit: env.INTERFACE.cpu_limit,
          cpu_request: env.INTERFACE.cpu_request,
          id_type: env.INTERFACE.IMAGE_TYPE.id_type,
          label_type_image: env.INTERFACE.IMAGE_TYPE.label,
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
              id_environment: env.id_environment,
              label: env.label,
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
    });
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that fetch all the informations of one environment.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const get = async function (
  props = {
    id_environment: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_environment: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_environment))
    throw new ParameterMisformed(
      'The props.id_environment parameter is misformed.'
    );
  try {
    const queryOptions = {
      where: { id_environment: props.id_environment },
      include: [
        {
          model: db.cirrus.ENVIRONMENT,
          required: true,
        },
        {
          model: db.cirrus.INTERFACE,
          required: true,
          include: [
            {
              model: db.cirrus.IMAGE_TYPE,
              required: true,
            },
            {
              model: db.cirrus.INTERFACE_HAS_ARGUMENT,
              include: [
                {
                  model: db.cirrus.ARGUMENT,
                  order: [['id_argument', 'DESC']],
                },
              ],
            },
            {
              model: db.cirrus.INTERFACE_HAS_NODE_SELECTOR,
              include: [
                {
                  model: db.cirrus.NODE_SELECTOR,
                },
              ],
            },
            {
              model: db.cirrus.INTERFACE_HAS_PORT,
              include: [
                {
                  model: db.cirrus.PORT_TYPE,
                },
              ],
            },
            {
              model: db.cirrus.INTERFACE_HAS_VARIABLE,
              include: [
                {
                  model: db.cirrus.VARIABLE_ENVIRONMENT,
                },
              ],
            },
          ],
        },
      ],
    };
    return await Promise.resolve(
      db.cirrus.ENVIRONMENT_HAS_INTERFACE.findAll(queryOptions)
    ).then((r) => {
      let result;
      for (let env of r) {
        const options = {
          id_interface: env.INTERFACE.id_interface,
          label: env.label,
          default_label: env.INTERFACE.label,
          registry_link: env.INTERFACE.registry_link,
          exec_command: env.INTERFACE.exec_command,
          service_command: env.INTERFACE.service_command,
          privileged: env.INTERFACE.privileged,
          readiness_probe_initial_delay:
            env.INTERFACE.readiness_probe_initial_delay,
          liveness_probe_initial_delay:
            env.INTERFACE.liveness_probe_initial_delay,
          readiness_probe_period: env.INTERFACE.readiness_probe_period,
          liveness_probe_period: env.INTERFACE.liveness_probe_period,
          need_compute_gpu: env.INTERFACE.need_compute_gpu,
          need_graphical_rendering_gpu:
            env.INTERFACE.need_graphical_rendering_gpu,
          ram_limit: env.INTERFACE.ram_limit,
          ram_request: env.INTERFACE.ram_request,
          cpu_limit: env.INTERFACE.cpu_limit,
          cpu_request: env.INTERFACE.cpu_request,
          id_type: env.INTERFACE.IMAGE_TYPE.id_type,
          label_type_image: env.INTERFACE.IMAGE_TYPE.label,
          args: env.INTERFACE.INTERFACE_HAS_ARGUMENTs.sort(
            (a, b) => a.id_argument - b.id_argument
          ).map((arg) => ({
            id_argument: arg.id_argument,
            value: arg.ARGUMENT.value,
          })),
          node_selectors: env.INTERFACE.INTERFACE_HAS_NODE_SELECTORs.map(
            (ins) => ({
              id_node_selector: ins.id_node_selector,
              key: ins.NODE_SELECTOR.key,
              value: ins.NODE_SELECTOR.value,
            })
          ),
          ports: env.INTERFACE.INTERFACE_HAS_PORTs.map((ihp) => ({
            id_port_type: ihp.id_port_type,
            port: ihp.port,
            label: ihp.label,
            port_type: ihp.PORT_TYPE.label,
            display_name: ihp.display_name,
            icon: ihp.icon,
          })),
          envs: env.INTERFACE.INTERFACE_HAS_VARIABLEs.map((ihv) => ({
            id_variable_environment: ihv.id_variable_environment,
            key: ihv.VARIABLE_ENVIRONMENT.key,
            value: ihv.VARIABLE_ENVIRONMENT.value,
          })),
        };
        if (result === undefined) {
          result = new Environment({
            id_environment: env.id_environment,
            label: env.label,
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
    throw db.sequelizeErrorManagement(err);
  }
};
