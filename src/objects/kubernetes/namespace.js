import * as kapi from '../../modules/kapi.module.js';
import CONFIG from '../../config/config.js';
import {
  EmptyStringHashError,
  KubernetesAPINotResponding,
  MissingArgumentError,
} from '../../utils/errors.util.js';

export const deletion = async function (
  { hash = undefined } = {},
  fetch = kapi.fetch
) {
  if (hash === undefined)
    throw new MissingArgumentError(
      "Cannot read properties of undefined (reading 'hash')."
    );
  if (hash === '')
    throw new EmptyStringHashError('You must pass the hash argument.');

  const url = `${CONFIG.KUBERNETES_URL}/api/v1/namespaces/n${hash}`;
  return await Promise.resolve(fetch({ url, method: 'DELETE' }))
    .then((res) => {
      return {
        result: res,
        type: 'Namespace',
        name: `n${hash}`,
      };
    })
    .catch((err) => {
      throw new KubernetesAPINotResponding(err.message);
    });
};

export const create = async function (
  { hash = undefined } = {},
  fetch = kapi.fetch
) {
  if (hash === undefined)
    throw new MissingArgumentError(
      "Cannot read properties of undefined (reading 'hash')."
    );
  if (hash === '')
    throw new EmptyStringHashError('You must pass the hash argument.');

  const body = {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: {
      name: `n${hash}`, // Replace with your desired namespace name
      labels: {
        'kubernetes.io/metadata.name': `n${hash}`,
        type: 'Namespace',
        hash: `${hash}`,
        name: 'user-app-namespace',
      },
    },
    status: {
      phase: 'Active', // This is typically managed by Kubernetes
    },
  };
  const url = `${CONFIG.KUBERNETES_URL}/api/v1/namespaces`;
  return await Promise.resolve(fetch({ url, method: 'POST', body })).then(
    (res) => {
      return {
        result: res,
        type: 'Namespace',
        name: `n${hash}`,
      };
    }
  );
};
