import CONFIG from '../config/config.js';
import * as nf from 'node-fetch';
import {
  ConnetexKubernetesAPIError,
  KubernetesAPIInvalidURL,
  KubernetesAPINotResponding,
  KubernetesAPITimedOut,
  KubernetesAPIx509Certificate,
  KubernetesErrorNotDefined,
  ObjectsAlreadyExistsError,
} from '../utils/errors.util.js';
import logs from '../middlewares/winston.js';

/**
 * Function used to communicate with the Kubernetes API.
 * @param {String} url URI to fetch on the Kubernetes API
 * @param {String} method method to use. (GET/POST/DELETE/PATCH...etc)
 * @param {JSON} body particular body to send.
 * @param {Function} fetch overwriting fetch for test.
 * @param {Number} retries number of retries to execute on fail.
 * @param {Number} retryDelay how many ms between retries.
 * @returns {JSON}
 */
export const fetch = async function (
  { url = '', method = 'GET', body = undefined } = {},
  fetch = nf.default,
  retries = 20, // Number of retry attempts
  retryDelay = 3000 // Delay between retries in ms
) {
  if (!CONFIG.KUBERNETES_ACTIVATED) return 'Kubernetes is not activated.';
  // convert body from JSON to string for fetch command
  let raw_body;
  if (method !== 'GET' && method !== 'DELETE') {
    raw_body = JSON.stringify(body);
  }

  // headers to set authentication token
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + CONFIG.KUBERNETES_TOKEN,
  };

  const options = {
    headers,
    method,
  };

  // add agent only on production envs
  if (CONFIG.KUBERNETES_AGENT) {
    options.agent = CONFIG.KUBERNETES_AGENT;
  }

  // add body on nonGET and nonDELETE method request
  if (method !== 'GET' && method !== 'DELETE') {
    options.body = raw_body;
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${CONFIG.KUBERNETES_URL}${url}`, options);
      const contentType = res.headers.get('content-type');
      if (res.status === 429 || res.status === 504 || res.status === 502)
        throw new KubernetesAPITimedOut(
          'Kubernetes API timed out or bad gateway'
        );
      else if (res.status === 409 && res.statusText === 'Conflict') {
        logs.debug(
          `[KUBERNETES][${res.status}] / : ${body.kind} ${body.metadata.name} Already present on the cluster (in namespace ${body.metadata.namespace}).`
        );
        return `${body.kind} ${body.metadata.name} Already present on the cluster (in namespace ${body.metadata.namespace}).`;
      }

      let fetchData;
      if (contentType?.includes('application/json')) {
        fetchData = await res.json();
      } else {
        fetchData = await res.text();
      }

      if (res.status >= 400) {
        logs.debug(
          `[KUBERNETES][${res.status}] / : ${body.kind} ${body.metadata.name} (in namespace ${body.metadata.namespace}) says : `,
          fetchData
        );
        throw new KubernetesErrorNotDefined(
          `Kubernetes API returned status code ${res.status}`
        );
      }

      if (typeof data === 'string') {
        if (fetchData.includes('the target machine actively refused it'))
          throw new ConnetexKubernetesAPIError(fetchData);
        if (fetchData.includes('x509: cannot verify signature'))
          throw new KubernetesAPIx509Certificate(fetchData);
      } else if (typeof fetchData === 'object') {
        if (fetchData.reason === 'AlreadyExists')
          throw new ObjectsAlreadyExistsError(fetchData.message);
      }
      return fetchData;
    } catch (err) {
      if (attempt < retries) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        // If it's the last attempt, throw the error
        if (
          err instanceof KubernetesAPIx509Certificate ||
          err instanceof ConnetexKubernetesAPIError ||
          err instanceof ObjectsAlreadyExistsError ||
          err instanceof KubernetesAPITimedOut
        )
          throw err;
        else if (err.message.includes('ECONNREFUSED'))
          throw new KubernetesAPINotResponding(err.message);
        if (err.message.includes('Invalid URL'))
          throw new KubernetesAPIInvalidURL(err.message);
        else throw new KubernetesErrorNotDefined(err.message);
      }
    }
  }
};
