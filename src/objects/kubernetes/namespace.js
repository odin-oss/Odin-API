import * as kapi from '../../modules/kapi.module.js';
import z from 'zod';
import Guard from '../../utils/guard.util.js';
import logs from '../../middlewares/winston.js';

/**
 * Delete a namespace from kubernetes cluster.
 * @param {String} hash unique hash used to find the application on the cluster.
 * @param {Function} fetch functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const deletion = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  const url = `/api/v1/namespaces/n${data.hash}`;
  return await fetch({ url, method: 'DELETE' }).then((res) => ({
    result: res,
    type: 'Namespace',
    name: `n${data.hash}`,
  }));
};

/**
 * Create a new namespace on the kubernetes cluster.
 * @param {String} hash unique hash used to find the application on the cluster.
 * @param {Function} fetch functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const create = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(4).max(6),
  });
  const data = Guard.validateProps(schema, props);
  const name = `${(data.hash === 'odin' && 'odin') || 'n' + data.hash}`;
  const body = {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: {
      name,
      labels: {
        'kubernetes.io/metadata.name': name,
        type: 'Namespace',
        hash: `${data.hash}`,
        name: 'user-app-namespace',
      },
    },
    status: {
      phase: 'Active', // This is typically managed by Kubernetes
    },
  };
  const url = `/api/v1/namespaces`;
  return await fetch({ url, method: 'POST', body }).then((res) => ({
    result: res,
    type: 'Namespace',
    name,
  }));
};
