import z from 'zod';
import * as interface_builder from '../builders/interface.builder.js';
import { Interface } from '../objects/Interface.js';
import Guard from '../utils/guard.util.js';

/**
 * Service that will get a specific interface infos and send back an Interface object.
 * @param {Number} id_interface id of the interface we want to get.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Interface}
 */
export const get = async function (
  props,
  fns = {
    interface_get: interface_builder.get,
  }
) {
  const schema = z.object({
    id_interface: z.number().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.interface_get({ ...data });
};

/**
 * Service that launchs the fetch of infos of every interfaces.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Array<Interface>}
 */
export const list = async function (
  fns = {
    interface_list: interface_builder.list,
  }
) {
  return await fns.interface_list();
};
/**
 * Service that launchs creation of a new interface.
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
export const create = async function (
  props,
  fns = {
    create: interface_builder.create,
  }
) {
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
      z.string().regex(/^\d+m?$/, {
        message:
          'The string value of the CPU must be xx or xxm, xx being the integer.',
      }),
    ]),
    ram_request: z
      .string({ invalid_type_error: 'The RAM value must be a string.' })
      .regex(/^\d+(Gi|Mi)$/, {
        message: 'The RAM value must be as xxGi or xxMi, xx being the integer.',
      }),
    cpu_limit: z.union([
      z.number().int({ message: 'The CPU must be a string or an integer.' }),
      z.string().regex(/^\d+m?$/, {
        message:
          'The string value of the CPU must be xx or xxm, xx being the integer.',
      }),
    ]),
    ram_limit: z
      .string({ invalid_type_error: 'The RAM value must be a string.' })
      .regex(/^\d+(Gi|Mi)$/, {
        message: 'The RAM value must be as xxGi or xxMi, xx being the integer.',
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
  return await fns.create(data);
};

/**
 * Service that launchs the update of infos of a specific interface.
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
 * @param {Array<String>} args new args to set.
 * @param {Array<Port>} ports new ports to set.
 * @param {Array<envs>} envs new envs to set.
 * @param {Array<node_selectors>} node_selectors new node_selectors to set.
 * @param {Number} id_interface id of the interface to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Interface}
 */
export const update = async function (
  props,
  fns = {
    update: interface_builder.update,
    update_args: interface_builder.update_args,
    update_nodeselectors: interface_builder.update_nodeselectors,
    update_ports: interface_builder.update_ports,
    update_envs: interface_builder.update_envs,
  }
) {
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
        z.number().int({ message: 'The CPU must be a string or an integer.' }),
        z.string().regex(/^\d+m?$/, {
          message:
            'The string value of the CPU must be xx or xxm, xx being the integer.',
        }),
      ])
      .optional(),
    ram_request: z
      .string({ invalid_type_error: 'The RAM value must be a string.' })
      .regex(/^\d+(Gi|Mi)$/, {
        message: 'The RAM value must be as xxGi or xxMi, xx being the integer.',
      })
      .optional(),
    cpu_limit: z
      .union([
        z.number().int({ message: 'The CPU must be a string or an integer.' }),
        z.string().regex(/^\d+m?$/, {
          message:
            'The string value of the CPU must be xx or xxm, xx being the integer.',
        }),
      ])
      .optional(),
    ram_limit: z
      .string({ invalid_type_error: 'The RAM value must be a string.' })
      .regex(/^\d+(Gi|Mi)$/, {
        message: 'The RAM value must be as xxGi or xxMi, xx being the integer.',
      })
      .optional(),
    readiness_probe_initial_delay: z.coerce
      .number()
      .int()
      .positive()
      .optional(),
    readiness_probe_period: z.coerce.number().int().positive().optional(),
    liveness_probe_initial_delay: z.coerce.number().int().positive().optional(),
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
    args: z
      .array(
        z.string({ invalid_type_error: 'Each argument must be a string.' }),
        { invalid_type_error: 'Args should be an array of string.' }
      )
      .optional(),
    node_selectors: z
      .array(
        z.coerce
          .number()
          .int()
          .positive({ message: 'Each ID must be a positive integer.' }),
        { invalid_type_error: 'Arrays of ids should be an array.' }
      )
      .optional(),
    ports: z
      .array(
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
      )
      .optional(),
    envs: z
      .array(
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
      )
      .optional(),
  });
  const data = Guard.validateProps(schema, props);
  const promises = [];
  // Identifying what to update
  if (['args'].every((key) => Object.hasOwn(data, key)))
    promises.push(fns.update_args(data));
  if (['node_selectors'].every((key) => Object.hasOwn(data, key)))
    promises.push(fns.update_nodeselectors(data));
  if (['ports'].every((key) => Object.hasOwn(data, key)))
    promises.push(fns.update_ports(data));
  if (['envs'].every((key) => Object.hasOwn(data, key)))
    promises.push(fns.update_envs(data));
  await Promise.all(promises);
  return await fns.update(data);
};
