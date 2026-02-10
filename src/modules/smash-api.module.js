import fetch from 'node-fetch';
import CONFIG from '../config/config.js';
import z from 'zod';
import Guard from '../utils/guard.util.js';

/**
 * Generic method to do all the requests to smash api.
 * @param {String} route route to fetch (URI).
 * @param {String} method method to use to fetch.
 * @param {Object} body body to launch.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Response}
 */
export const smash_module = async (
  props,
  fns = {
    fetch
  }
) => {
  const schema = z.object({
    route: z.string(),
    method: z.enum(["get", "post", "delete"]),
    body: z.object().default({})
  });
  const data = Guard.validateProps(schema, props);
  const smash_version = '01-2024';
  const smash_region = CONFIG.SMASH_STORAGE_CARRIER_REGION;
  const url = `https://transfer.${smash_region}.fromsmash.co${data.route}?version=${smash_version}`;

  // Options
  const opt = {
    method: data.method,
    body: JSON.stringify(data.body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CONFIG.SMASH_STORAGE_CARRIER_API_KEY}`,
    },
  };

  return await fns.fetch(url, opt)
};

/**
 * Delete transfer from Smash API.
 * @param {Number} transfer_id transfer id to identify the transfer to delete from Smash API.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON} 
 */
export const exec_transfer_deletion = async (
  props,
  fns = {
    smash_module,
  }
) => {
  const schema = z.object({
    transfer_id: z.string()
  });
  const data = Guard.validateProps(schema, props);
  return await fns.smash_module({
      route: `/transfer/${data.transfer_id}`,
      method: 'delete',
    }
  ).then((response) => response.json());
};
