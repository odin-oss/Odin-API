import * as datacenter_builder from '../builders/datacenter.builder.js';

/**
 * Service that launchs the fetchs the list of datacenters through builder.
 * @param {*} fns
 * @returns
 */
export const list = async function (
  fns = {
    datacenter_list: datacenter_builder.list,
  }
) { return await Promise.resolve(fns.datacenter_list())};
