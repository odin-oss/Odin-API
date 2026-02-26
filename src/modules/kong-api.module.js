import * as nf from 'node-fetch';
import CONFIG from '../config/config.js';
import {
  AppsIngressErrorNotDefined,
  AppsIngressNotReachable,
} from '../utils/errors.util.js';
import logger from '../middlewares/winston.js';

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
  if (!CONFIG.APPS_INGRESS_ACTIVATED)
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
    const res = await fetch(`http://${CONFIG.APPS_INGRESS_URL}${url}`, options);
    if (!res.headers.get('content-type')?.includes('application/json'))
      return { result: 'ok' };
    let data = await res.json();
    if (data.name === 'unique constraint violation')
      logger.debug(
        `[KONG][${res.status}}] / : 3/5. KONG Error: The services/routes already exists in Kong, skipping creation.`
      );
    if (
      data?.fields?.name ===
      "plugin 'odin-auth' not enabled; add it to the 'plugins' configuration property"
    )
      logger.error(
        `[KONG][${res.status}}] / : 3/5. KONG Error: You must add the 'odin-auth' plugin to the 'plugins' configuration property in Kong, skipping creation.`
      );

    return data;
  } catch (err) {
    if (err instanceof nf.FetchError)
      throw new AppsIngressNotReachable(err.message);
    throw new AppsIngressErrorNotDefined(err.message);
  }
};
