import fetch from 'node-fetch';
import CONFIG from '../config/config.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 *  Function to interact with smash API
 */

const smash_module = async (
  props = {
    route,
    method: 'get',
    body: {},
  },
  fns = {
    fetch: fetch,
  }
) => {
  const smash_version = '01-2024';
  const smash_region = CONFIG.smash_storage_carrier_region;
  const url = `https://transfer.${smash_region}.fromsmash.co${props.route}?version=${smash_version}`;

  // Options
  const opt = {
    method: props.method,
    body: JSON.stringify(props.body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CONFIG.smash_storage_carrier_api_key}`,
    },
  };

  return await Promise.resolve(fns.fetch(url, opt)).catch((err) => {
    console.log(err);
  });
};

export default smash_module;

/*
 * Delete a smash transfer
 */
export const exec_transfer_deletion = async (
  props = {
    transfer_id: undefined,
  },
  fns = {
    smash_module: smash_module,
  }
) => {
  return await Promise.resolve(
    fns.smash_module({
      route: `/transfer/${props.transfer_id}`,
      method: 'delete',
    })
  ).then((response) => response.json());
};
