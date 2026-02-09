import CONFIG from '../config/config.js';
import * as nf from 'node-fetch';
import fs from 'fs/promises';
import {
  ConnetexKubernetesAPIError,
  KubernetesAPIInvalidURL,
  KubernetesAPINotResponding,
  KubernetesAPITimedOut,
  KubernetesAPIx509Certificate,
  KubernetesErrorNotDefined,
  ObjectsAlreadyExistsError,
} from '../utils/errors.util.js';

/**
 * Function used to communicate with the Kubernetes API.
 * @param {*} param0
 * @param {*} fetch
 * @returns
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
  if (CONFIG.APP_ENVIRONMENT !== 'local' && CONFIG.APP_ENVIRONMENT !== 'test') {
    options.agent = CONFIG.KUBERNETES_AGENT;
  }

  // add body on nonGET and nonDELETE method request
  if (method !== 'GET' && method !== 'DELETE') {
    options.body = raw_body;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await Promise.resolve(fetch(url, options));
      const contentType = res.headers.get('content-type');

      if (res.status === 429 || res.status === 504 || res.status === 502)
        throw new KubernetesAPITimedOut(
          'Kubernetes API timed out or bad gateway'
        );
      else if (res.status >= 400)
        throw new KubernetesErrorNotDefined(
          `Kubernetes API returned status code ${res.status}`
        );

      let data;
      if (contentType?.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      if (typeof data === 'string') {
        if (data.includes('the target machine actively refused it'))
          throw new ConnetexKubernetesAPIError(data);
        if (data.includes('x509: cannot verify signature'))
          throw new KubernetesAPIx509Certificate(data);
      } else if (typeof data === 'object') {
        if (data.reason === 'AlreadyExists')
          throw new ObjectsAlreadyExistsError(data.message);
      }
      fs.appendFile(
        './src/tmp_deployment/kapi.log',
        JSON.stringify(data) + '\n',
        'utf8'
      );
      return data;
    } catch (err) {
      fs.appendFile(
        './src/tmp_deployment/kapi.log',
        JSON.stringify(err) + '\n',
        'utf8'
      );
      fs.appendFile(
        './src/tmp_deployment/kapi.log',
        JSON.stringify('retrying for attempt ' + attempt + '/' + retries) +
          '\n',
        'utf8'
      );
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
