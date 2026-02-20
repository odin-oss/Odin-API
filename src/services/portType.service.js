import * as portType_builder from '../builders/portType.builder.js';
import PortType from '../objects/Port_type.js';

/**
 * Listing all the port_types.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Array<PortType>}
 */
export const list = async function (
  fns = {
    portType_list: portType_builder.list,
  }
) {
  return await fns.portType_list();
};
