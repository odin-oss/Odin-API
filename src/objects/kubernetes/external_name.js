import z from 'zod';
import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import Guard from '../../utils/guard.util.js';

/**
 * Function that executes the deletion of all the externalname contained in the cirrus namespace and the match the hash.
 * @param {String} hash unique hash to identify specific external name resources.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const deletion = async function (
  props,
  fns = { get: get, delete: del }
) {
  const schema = z.object({
    hash: z.string().min(8).max(8),
  });
  const data = Guard.validateProps(schema, props);
  const list = await fns.get({ ...data }).then((r) => r.result);
  if (list === 'Kubernetes is not activated.') return;
  const promises = list.map((name) => fns.delete({ name }));
  return await Promise.all(promises);
};

/**
 * Function that executes the creation of an externalname in the cirrus namespace on Kubernetes.
 * @param {String} hash unique hash to identify specific external name resources.
 * @param {String} label label of the application.
 * @param {Number} port_externe port to point from this external name.
 * @param {Function} fetch functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const create = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(8).max(8),
    label: z.string(),
    port_externe: z.number().positive(),
  });
  const data = Guard.validateProps(schema, props);
  const body = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: `ci${data.label}${data.hash}${data.port_externe}-proxy`,
      namespace: 'cirrus',
      labels: {
        type: 'ExternalName',
        hash: `${data.hash}`,
        shutable: 'true',
      },
    },
    spec: {
      externalName: `ci${data.label}${data.hash}${data.port_externe}.n${data.hash}.svc.cluster.local`,
      ports: [
        {
          port: data.port_externe,
          protocol: 'TCP',
        },
      ],
      type: 'ExternalName',
    },
  };
  const url = `/api/v1/namespaces/cirrus/services`;
  return await fetch({ url, method: 'POST', body }).then((res) => ({
    result: res,
    type: 'ExternalName',
    name: `ci${data.label}${data.hash}${data.port_externe}-proxy`,
  }));
};

/**
 * Private function that will fetch the KAPI.
 * @param {String} hash unique has the application.
 * @param {Boolean} onlyShutable filter the result only of shutable resources if set to true - default true.
 * @param {Function} fetch functions to overwrite for unit testing.
 * @returns {JSON}
 */
const get = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(8).max(8),
    onlyShutable: z.boolean().default(true),
  });
  const data = Guard.validateProps(schema, props);
  const url = `/api/v1/namespaces/cirrus/services?labelSelector=type=ExternalName,hash=${data.hash},shutable=${{ ...expected_props, ...props }.onlyShutable ? 'true' : 'false'}`;
  return await fetch({ url, method: 'GET' }).then((res) => {
    if (res === 'Kubernetes is not activated.') return { result: res };
    return {
      result: res?.items.map((item) => item.metadata.name),
      type: 'ExternalName',
    };
  });
};
/**
 * Private function that will fetch the KAPI to delete an external name from cluster.
 * @param {String} name name of the application to delete.
 * @param {Function} fetch functions to overwrite for unit testing.
 * @returns {JSON}
 */
const del = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    name: z.string(),
  });
  const data = Guard.validateProps(schema, props);
  const url = `/api/v1/namespaces/cirrus/services/${data.name}`;
  return await fetch({ url, method: 'DELETE' }).then((res) => ({
    result: res,
    type: 'ExternalName',
    name: `${data.name}`,
  }));
};

const test_exports = {};
if (CONFIG.APP_ENVIRONMENT === 'test') {
  test_exports.del = del;
  test_exports.get = get;
}
export { test_exports };
