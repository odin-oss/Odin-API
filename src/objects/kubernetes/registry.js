import z from 'zod';
import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import Guard from '../../utils/guard.util.js';

/**
 * Function used to delete the registryhub from Kubernetes cluster.
 * @param {String} hash unique hash to identify specific registryhub resources.
 * @param {Function} fetch functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const deletion = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(8).max(8),
  });
  const data = Guard.validateProps(schema, props);
  const url = `/api/v1/namespaces/n${data.hash}/secrets/registryhub`;
  return await fetch({ url, method: 'DELETE' }).then((res) => ({
    result: res,
    type: 'RegistryHub',
    name: `registryhub`,
  }));
};

/**
 * Function used to create RegistryHub into the Kubernetes cluster.
 * @param {String} hash unique hash to identify specific external name resources.
 * @param {Function} fetch functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const create = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(8).max(8),
  });
  const data_checks = Guard.validateProps(schema, props);
  const data = {
    auths: {
      [CONFIG.REGISTRY_URL]: {
        username: CONFIG.REGISTRY_USERNAME,
        password: CONFIG.REGISTRY_PASSWORD,
      },
    },
  };

  const body = {
    data: {
      '.dockerconfigjson': `${Buffer.from(JSON.stringify(data)).toString('base64')}`,
    },
    metadata: {
      name: 'registryhub',
      namespace: `n${data_checks.hash}`,
      labels: {
        type: 'RegistryHub',
        hash: `${data_checks.hash}`,
      },
    },
    type: 'kubernetes.io/dockerconfigjson',
  };
  const url = `/api/v1/namespaces/n${data_checks.hash}/secrets`;
  return await fetch({ url, method: 'POST', body }).then((res) => ({
    result: res,
    type: 'RegistryHub',
    name: `registryhub`,
  }));
};
