import dbManager from '../config/db.config.js';
import {
  DBObjectNotFound,
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.service.js';
import { Interface } from '../objects/Interface.js';
import Guard from '../utils/guard.service.js';

/**
 * Builder that fetchs the DB to get the interface.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const get = async function (
  props = {
    id_interface: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_interface: undefined,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_id(props.id_interface))
    throw new ParameterMisformed(
      'The props.id_interface parameter is misformed.'
    );
  const options = {
    where: { id_interface: props.id_interface },
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
  return await Promise.resolve(dbManager.models.INTERFACE.findOne(options))
    .then((r) => {
      if (r == null)
        throw new DBObjectNotFound('The interface could not be found.');
      return new Interface({
        id_interface: r.id_interface,
        label: r.label,
        registry_link: r.registry_link,
        exec_command: r.exec_command,
        service_command: r.service_command,
        privileged: r.privileged,
        readiness_probe_initial_delay: r.readiness_probe_initial_delay,
        liveness_probe_initial_delay: r.liveness_probe_initial_delay,
        readiness_probe_period: r.readiness_probe_period,
        liveness_probe_period: r.liveness_probe_period,
        need_compute_gpu: r.need_compute_gpu,
        need_graphical_rendering_gpu: r.need_graphical_rendering_gpu,
        ram_limit: r.ram_limit,
        ram_request: r.ram_request,
        cpu_limit: r.cpu_limit,
        cpu_request: r.cpu_request,
        id_type: r.IMAGE_TYPE.id_type,
        label_type_image: r.IMAGE_TYPE.label,
        args: r.INTERFACE_HAS_ARGUMENTs.sort(
          (a, b) => a.id_argument - b.id_argument
        ).map((arg) => ({
          id_argument: arg.id_argument,
          value: arg.ARGUMENT.value,
        })),
        node_selectors: r.INTERFACE_HAS_NODE_SELECTORs.map((ins) => ({
          id_node_selector: ins.id_node_selector,
          key: ins.NODE_SELECTOR.key,
          value: ins.NODE_SELECTOR.value,
        })),
        ports: r.INTERFACE_HAS_PORTs.map((ihp) => ({
          id_port_type: ihp.id_port_type,
          port: ihp.port,
          label: ihp.label,
          port_type: ihp.PORT_TYPE.label,
          display_name: ihp.display_name,
          icon: ihp.icon,
        })),
        envs: r.INTERFACE_HAS_VARIABLEs.map((ihv) => ({
          id_variable_environment: ihv.id_variable_environment,
          key: ihv.VARIABLE_ENVIRONMENT.key,
          value: ihv.VARIABLE_ENVIRONMENT.value,
        })),
      });
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};
