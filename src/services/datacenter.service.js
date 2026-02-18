import * as datacenter_builder from '../builders/datacenter.builder.js';
import { Datacenter } from '../objects/Datacenter.js';

/**
 * Service that launchs the fetchs the list of datacenters through builder.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Array<Datacenter>}
 */
export const list = async function (
  fns = {
    datacenter_list: datacenter_builder.list,
  }
) {
  return await fns.datacenter_list();
};
