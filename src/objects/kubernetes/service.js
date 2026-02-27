import z from 'zod';
import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import Guard from '../../utils/guard.util.js';

/**
 * Enum of Service Type (Loadbalancer or ClusterIP).
 */
export const SVC_TYPE = Object.freeze({
  LOADBALANCER: 1,
  CLUSTERIP: 2,
});
/**
 * Function that will launch the deletion of the service in the kubernetes cluster.
 * @param {String} hash unique hash to identify service resources.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const deletion = async function (
  props,
  fns = { get_service: get, delete_service: del }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  const list = await fns.get_service({ ...data }).then((r) => r.result);
  return await Promise.all(
    list.map((name) => fns.delete_service({ ...data, name }))
  );
};
/**
 * Function that will launch the creation of the service in the Kubernetes cluster.
 * @param {String} hash unique hash to identify service resources.
 * @param {String} label label of the application.
 * @param {Number} port_externe port to point from this service.
 * @param {Number} port_interne port serve from this service.
 * @param {SVC_TYPE} type type of service to deploy - default CLUSTERIP.
 * @param {Boolean} shutable is this new resource able to be deleted safely on stop.
 * @param {Function} fetch functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const create = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
    label: z.string(),
    port_externe: z.number().positive(),
    port_interne: z.number().positive(),
    type: z
      .union([z.literal(SVC_TYPE.LOADBALANCER), z.literal(SVC_TYPE.CLUSTERIP)])
      .default(SVC_TYPE.CLUSTERIP),
    shutable: z.boolean().default(true),
  });
  const data = Guard.validateProps(schema, props);
  const prefix = data.type === SVC_TYPE.CLUSTERIP ? 'ci' : 'lb';
  const typeStr =
    data.type === SVC_TYPE.CLUSTERIP ? 'ClusterIP' : 'LoadBalancer';
  const body = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: `${prefix}${data.label}${data.hash}${data.port_externe}`,
      namespace: `n${data.hash}`,
      labels: {
        type: 'Service',
        hash: `${data.hash}`,
        shutable: data.shutable ? 'true' : 'false',
      },
    },
    spec: {
      ports: [
        {
          port: data.port_interne,
          protocol: 'TCP',
        },
      ],
      //externalIPs: [`${CONFIG.master_ip}`],
      selector: {
        app: `${data.label}${data.hash}`,
      },
      sessionAffinity: 'ClientIP',
      type: `${typeStr}`,
    },
  };
  const url = `/api/v1/namespaces/n${data.hash}/services`;
  return await fetch({ url, method: 'POST', body }).then((res) => ({
    result: res,
    type: 'Service',
    name: `${prefix}${data.label}${data.hash}${data.port_externe}`,
  }));
};

/**
 * Private function that will fetch the Kubernetes API in order to get the name of the services attached to this hash.
 * @param {String} hash unique hash to identify service resources.
 * @param {Function} fetch functions to overwrite for unit testing.
 * @returns {JSON}
 */
const get = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  const url = `/api/v1/namespaces/n${data.hash}/services?labelSelector=hash=${data.hash}`;
  return await fetch({ url, method: 'GET' }).then((res) => ({
    result: res.items.map((item) => item.metadata.name),
    type: 'Services',
  }));
};
/**
 * Private function that executes the deleteion of the service in the Kubernetes API.
 * @param {String} hash unique hash to identify service resources.
 * @param {String} name name of the application to delete.
 * @param {Function} fetch functions to overwrite for unit testing.
 * @returns {JSON}
 */
const del = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
    name: z.string(),
  });
  const data = Guard.validateProps(schema, props);
  const url = `/api/v1/namespaces/n${data.hash}/services/${data.name}`;
  return await fetch({ url, method: 'DELETE' }).then((res) => ({
    result: res,
    type: 'Service',
    name: `${data.name}`,
  }));
};

/**
 * Function that will fetch kapi to get all the Services in a specific namespace.
 * @param {String} hash unique hash to identify the application on the cluster.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const get_services = async (
  props,
  fns = {
    fetch: kapi.fetch,
  }
) => {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  return await fns
    .fetch({
      method: 'GET',
      url: `/api/v1/namespaces/n${data.hash}/services`,
    })
    .then((r) => {
      for (let item of r.items) {
        item.kind = 'Service';
      }
      return r;
    });
};

const test_exports = {};
if (CONFIG.APP_ENVIRONMENT === 'test') {
  test_exports.del = del;
  test_exports.get = get;
}
export { test_exports };
