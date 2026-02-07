import * as nf from 'node-fetch';
import CONFIG from '../config/config.js';
import { AppsIngressErrorNotDefined } from '../utils/errors.service.js';
/**
 * Function used to communicate with the Kubernetes API.
 * @param {*} param0
 * @param {*} fetch
 * @returns
 */
export const fetch = async function (
  { url = '', method = 'GET', body = undefined, headers = undefined } = {},
  fetch = nf.default
) {
  if (!CONFIG.apps_ingress_activated)
    return 'Apps-Ingress (Kong) is not activated.';
  // convert body from JSON to string for fetch command
  let raw_body;
  if (method !== 'GET' && method !== 'DELETE') {
    raw_body = JSON.stringify(body);
  }

  // headers to set authentication token
  const h = {
    'Content-Type': 'application/json',
  };
  if (headers && headers['Content-Type'])
    h['Content-Type'] = headers['Content-Type'];

  const options = {
    headers: h,
    method,
  };

  // add body on nonGET and nonDELETE method request
  if (method !== 'GET' && method !== 'DELETE') {
    options.body = raw_body;
  }
  try {
    const res = await Promise.resolve(fetch(url, options));
    if (!res.headers.get('content-type')?.includes('application/json'))
      return { result: 'ok' };
    let data = await res.json();
    return data;
  } catch (err) {
    throw new AppsIngressErrorNotDefined(err.message);
  }
};
