import fetch from 'node-fetch';
import CONFIG from '../config/config.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Datacenter } from '../objects/Datacenter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fonction locale exécutant une requête sur l'API de Kubernetes.
 */
const deployment_module = async (
  props = { route, method: 'get', body: {}, datacenter: new Datacenter() },
  fns = {
    fetch: fetch,
  }
) => {
  // URL composition
  let url;
  if (CONFIG.env !== 'local') {
    url = `https://api.${props.datacenter.label}.${props.datacenter.provider}.${CONFIG.ms_deployment_base_url}:${CONFIG.mtls_ms_deployment_port}${props.route}`;
  } else {
    url = `${CONFIG.unsafe_ms_deployment_method}://${CONFIG.unsafe_ms_deployment_adress}:${CONFIG.unsafe_ms_deployment_port}${props.route}`;
  }

  // Options
  const opt = {
    method: props.method,
  };
  if (props.method.toLocaleLowerCase() !== 'get') {
    opt.body = JSON.stringify(props.body);
    opt.headers = { 'Content-Type': 'application/json' };
  }

  // Enabling MTLS communication
  if (CONFIG.env !== 'local') {
    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(path.resolve(__dirname, 'mtls/client.crt')),
      key: fs.readFileSync(path.resolve(__dirname, 'mtls/client.key')),
      ca: fs.readFileSync(path.resolve(__dirname, 'mtls/ca.crt')),
      rejectUnauthorized: true,
    });
    opt.agent = httpsAgent;
  }
  return await Promise.resolve(fns.fetch(url, opt));
};
export default deployment_module;

/**
 * Exécuter l'extinction d'un conteneur sur Kubernetes.
 */
export const exec_shutdown = async (
  props = { hash: undefined, datacenter: new Datacenter() },
  fns = {
    deployment_module: deployment_module,
  }
) => {
  if (CONFIG.ms_deployment_activated) {
    return await Promise.resolve(
      fns.deployment_module({
        datacenter: props.datacenter,
        route: `/deploy/off`,
        method: 'put',
        body: {
          hash: props.hash,
        },
      })
    ).then((response) => response.json());
  }
  return 'MS-Deployment have been disabled';
};

/**
 * Exécuter le démarrage d'un conteneur sur Kubernetes.
 */
export const exec_start = async (
  props = { hash: undefined, datacenter: new Datacenter() },
  fns = {
    deployment_module: deployment_module,
  }
) => {
  if (CONFIG.ms_deployment_activated) {
    return await Promise.resolve(
      fns.deployment_module({
        datacenter: props.datacenter,
        route: `/deploy/on`,
        method: 'put',
        body: {
          hash: props.hash,
        },
      })
    ).then((response) => response.json());
  }
  return 'MS-Deployment have been disabled';
};

/**
 * Exécuter la suppression d'un conteneur sur Kubernetes.
 */
export const exec_deletion = async (
  props = { hash: undefined, datacenter: new Datacenter() },
  fns = {
    deployment_module: deployment_module,
  }
) => {
  if (CONFIG.ms_deployment_activated) {
    return await Promise.resolve(
      fns.deployment_module({
        datacenter: props.datacenter,
        route: `/deploy/delete`,
        method: 'delete',
        body: {
          hash: props.hash,
        },
      })
    ).then((response) => response.json());
  }
  return 'MS-Deployment have been disabled';
};

export const exec_smash_export = async (
  props = {
    hash: undefined,
    upload_id: undefined,
    app_deletion: undefined,
    label: undefined,
    folder_path: undefined,
    storage_carrier_image: undefined,
    storage_carrier_image_tag: undefined,
    smash_api_key: undefined,
    smash_region: undefined,
    smash_teamid: undefined,
    web_title: undefined,
    upload_description: undefined,
    export_language: undefined,
    availability: undefined,
    sender_name: undefined,
    sender_email: undefined,
    receiver_email: undefined,
    datacenter: new Datacenter(),
  },
  fns = {
    deployment_module: deployment_module,
  }
) => {
  if (CONFIG.ms_deployment_activated) {
    return await Promise.resolve(
      fns.deployment_module({
        datacenter: props.datacenter,
        route: `/storage/export/smash`,
        method: 'post',
        body: {
          hash: props.hash,
          upload_id: props.upload_id,
          app_deletion: props.app_deletion,
          label: props.label,
          folder_path: props.folder_path,
          storage_carrier_image: props.storage_carrier_image,
          storage_carrier_image_tag: props.storage_carrier_image_tag,
          smash_api_key: props.smash_api_key,
          smash_region: props.smash_region,
          smash_teamid: props.smash_teamid,
          web_title: props.web_title,
          upload_description: props.upload_description,
          export_language: props.export_language,
          availability: props.availability,
          sender_name: props.sender_name,
          sender_email: props.sender_email,
          receiver_email: props.receiver_email,
        },
      })
    ).then((response) => response.json());
  }

  return 'MS-Deployment have been disabled';
};
