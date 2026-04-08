import z from 'zod';
import * as datacenter_builder from '../builders/datacenter.builder.js';
import { Datacenter } from '../objects/Datacenter.js';
import Guard from '../utils/guard.util.js';

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

/**
 * Service that launchs the execution of datacenter creation.
 * @param {String} label label of the new Datacenter to be created.
 * @param {String} provider provider of the new Datacenter to be created.
 * @param {String} city city of the new Datacenter to be created.
 * @param {Function} fns functions to overwriting for tests purpose.
 * @returns {Datacenter}
 */
export const create = async function (
  props,
  fns = {
    dc_create: datacenter_builder.create,
  }
) {
  const schema = z.object({
    label: z.string().min(2),
    city: z.string().min(2),
    provider: z.string().min(2),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.dc_create(data);
};
/**
 * Service that updates a datacenter informations.
 * @param {String} label label of the new Datacenter to be updated.
 * @param {String} provider provider of the new Datacenter to be updated.
 * @param {String} city city of the new Datacenter to be updated.
 * @param {Number} id_datacenter id of the datacenter to update.
 * @param {Function} fns functions to overwriting for tests purpose.
 * @returns {Datacenter}
 */
export const update = async function (
  props,
  fns = {
    dc_update: datacenter_builder.update,
  }
) {
  const schema = z.object({
    label: z.string().min(2),
    city: z.string().min(2),
    provider: z.string().min(2),
    id_datacenter: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.dc_update(data);
};

/**
 * Service that launchs the deleteion of datacenter.
 * @param {Number} id_datacenter id of the datacenter to update.
 * @param {Function} fns functions to overwriting for tests purpose.
 * @returns {Datacenter}
 */
export const del = async function (
  props,
  fns = {
    del: datacenter_builder.del,
  }
) {
  const schema = z.object({
    id_datacenter: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.del(data);
};

/**
 * Service function that fetch one datacenter from builder.
 * @param {Number} id_datacenter id of the datacenter to update.
 * @param {Function} fns functions to overwriting for tests purpose.
 * @returns {Datacenter}
 */
export const get = async function (
  props,
  fns = {
    dc_get: datacenter_builder.get,
  }
) {
  const schema = z.object({
    id_datacenter: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.dc_get(data);
};

/**
 * Service that launchs the execution of adding an agent to a datacenter.
 * @param {Number} id_datacenter id of the datacenter to which the agent will be added.
 * @param {String} id_agent id of the agent to be added.
 * @param {Function} fns functions to overwriting for tests purpose.
 * @returns {Datacenter}
 */
export const addAgent = async function (
  props,
  fns = {
    addAgent: datacenter_builder.addAgent,
  }
) {
  const schema = z.object({
    id_datacenter: z.coerce.number(),
    id_agent: z.string().min(2),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.addAgent(data);
};
