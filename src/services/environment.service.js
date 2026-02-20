import z from 'zod';
import * as environment_builder from '../builders/environment.builder.js';
import { Environment } from '../objects/Environment.js';
import Guard from '../utils/guard.util.js';

/**
 * Service that list all the Environments in an object array.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Array<Environment>}
 */
export const list = async (
  fns = {
    environment_list: environment_builder.list,
  }
) => {
  return await fns.environment_list();
};

/**
 * Service that will get a specific Environment.
 * @param {Number} id_environment id of the environment to get.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const get = async function (
  props,
  fns = {
    environment_get: environment_builder.get,
  }
) {
  const schema = z.object({
    id_environment: z.number().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.environment_get({ ...data });
};

/**
 * Creating a new Environment.
 * @param {String} label label of the new Environment to be created.
 * @param {String} icon icon of the new Environment to be created.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const create = async function (
  props,
  fns = {
    create: environment_builder.create,
  }
) {
  const schema = z.object({
    label: z.string().min(2),
    icon: z.string().min(2),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.create(data);
};

/**
 * Attaching an interface to the environment.
 * @param {String} label label of the new Environment to be created.
 * @param {Number} id_environment id of the environment to attach the interface to.
 * @param {Number} id_interface id of the interface to attach.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const attach_interface = async function (
  props,
  fns = {
    attach_interface: environment_builder.attach_interface,
  }
) {
  const schema = z.object({
    label: z.string().min(2),
    id_environment: z.coerce.number().int().positive(),
    id_interface: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.attach_interface(data);
};
/**
 * Detaching the interface from the environment.
 * @param {Number} id_environment id of the environment to attach the interface to.
 * @param {Number} id_interface id of the interface to attach.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const detach_interface = async function (
  props,
  fns = {
    detach_interface: environment_builder.detach_interface,
  }
) {
  const schema = z.object({
    id_environment: z.coerce.number().int().positive(),
    id_interface: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.detach_interface(data);
};

/**
 * Updating icon & label of environment.
 * @param {String} label label of the new Environment to be put.
 * @param {String} icon icon of the new Environment to be put.
 * @param {Number} id_environment id of the environment to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const update = async function (
  props,
  fns = {
    update: environment_builder.update,
  }
) {
  const schema = z.object({
    label: z.string().min(2),
    icon: z.string().min(2),
    id_environment: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.update(data);
};

/**
 * Updating label of interface in environment.
 * @param {String} label label of the interface to be put.
 * @param {Number} id_environment id of the environment to update.
 * @param {Number} id_interface id of the interface to update - on link with id_environment.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const update_interface = async function (
  props,
  fns = { update_interface: environment_builder.update_interface }
) {
  const schema = z.object({
    label: z.string().min(2),
    id_interface: z.coerce.number().int().positive(),
    id_environment: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.update_interface(data);
};

/**
 * Deleting the Environment.
 * @param {Number} id_environment id of the environment to update.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Environment}
 */
export const del = async function (
  props,
  fns = {
    del: environment_builder.del,
  }
) {
  const schema = z.object({
    id_environment: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.del(data);
};
