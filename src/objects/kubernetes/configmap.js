import * as kapi from '../../modules/kapi.module.js';
import * as fs from 'fs/promises';
import z from 'zod';
import Guard from '../../utils/guard.util.js';

/**
 * Function that will launch the creation of the ConfigMap into the Kubernets API.
 * @param {String} hash unique hash to identify the configmap in the cluster.
 * @param {String} path path of the file to read.
 * @param {String} namespace namespace in which we need to create the ConfigMap.
 * @param {String} name name of the ConfigMap.
 * @param {String} filename name of the file inside the ConfigMap.
 * @param {Boolean} shutable is it safe to delete.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const create = async function (
  props,
  fns = {
    fetch: kapi.fetch,
    readFile: fs.readFile,
  }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
    path: z.string(),
    namespace: z.string().min(1),
    name: z.string().min(1),
    filename: z.string().min(1),
    shutable: z.boolean().default(true),
  });
  const data_checks = Guard.validateProps(schema, props);
  const data = await fns.readFile(data_checks.path, 'utf8');
  const body = {
    apiVersion: 'v1',
    data: {
      [data_checks.filename]: data,
    },
    metadata: {
      name: `${data_checks.name}`,
      namespace: `${data_checks.namespace}`,
      labels: {
        type: 'ConfigMap',
        hash: `${data_checks.hash}`,
        shutable: data_checks.shutable ? 'true' : 'false',
      },
    },
  };
  const url = `/api/v1/namespaces/${data_checks.namespace}/configmaps`;
  return await fns.fetch({ url, method: 'POST', body }).then((res) => ({
    result: res,
    type: 'ConfigMap',
    name: `${data_checks.name}`,
  }));
};
/**
 * Function that will update the configmap in the kubernetes cluster.
 * @param {String} path path of the file to read.
 * @param {String} namespace namespace in which we need to create the ConfigMap.
 * @param {String} name name of the ConfigMap.
 * @param {String} filename name of the file inside the ConfigMap.
 * @param {Boolean} shutable is it safe to delete.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const update = async function (
  props,
  fns = {
    fetch: kapi.fetch,
    readFile: fs.readFile,
  }
) {
  const schema = z.object({
    path: z.string(),
    namespace: z.string().min(1),
    name: z.string().min(1),
    filename: z.string().min(1),
    shutable: z.boolean().default(true),
  });
  const data_checks = Guard.validateProps(schema, props);
  const data = await fns.readFile(data_checks.path, 'utf8');
  const body = {
    data: {
      [data_checks.filename]: data,
    },
    metadata: {
      name: `${data_checks.name}`,
      namespace: `${data_checks.namespace}`,
      labels: {
        type: 'ConfigMap',
        shutable: data_checks.shutable ? 'true' : 'false',
      },
    },
  };
  const url = `/api/v1/namespaces/${data_checks.namespace}/configmaps/${data_checks.name}`;
  return await fns.fetch({ url, method: 'PUT', body }).then((res) => res);
};
