import z from 'zod';
import * as interface_builder from '../builders/interface.builder.js';
import Guard from '../utils/guard.service.js';
import { Interface } from '../objects/Interface.js';

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
    id_interface: z.number().positive()
  });
  const data = Guard.validateProps(schema, props);
  return await fns.interface_get({ ...data });
};
