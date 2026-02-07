import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../utils/errors.service.js';
import * as parametres from '../../utils/parametres.service.js';

/**
 * Enum of Service Type (Loadbalancer or ClusterIP).
 */
export const SVC_TYPE = Object.freeze({
  LOADBALANCER: 1,
  CLUSTERIP: 2,
});
/**
 * Function that will launch the deletion of the service in the kubernetes cluster.
 * @param {*} param0
 * @returns
 */
export const deletion = async function (
  props = { hash: undefined },
  fns = { get_service: get, delete_service: del }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');

  const list = await Promise.resolve(
    fns.get_service({ hash: props.hash, onlyShutable: true })
  ).then((r) => {
    return r.result;
  });
  const promises = list.map((name) =>
    fns.delete_service({ name, hash: props.hash })
  );
  return await Promise.all(promises).then((r) => {
    return r;
  });
};
/**
 * Function that will launch the creation of the service in the Kubernetes cluster.
 * @param {*} param0
 * @returns
 */
export const create = async function (
  props = {
    label: undefined,
    hash: undefined,
    port_externe: undefined,
    port_interne: undefined,
    type: SVC_TYPE.CLUSTERIP,
    shutable: true,
  },
  fetch = kapi.fetch
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    label: undefined,
    hash: undefined,
    port_externe: undefined,
    port_interne: undefined,
    type: SVC_TYPE.CLUSTERIP,
    shutable: true,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!parametres.check_libelle(props.label, 3))
    throw new ParameterMisformed('The props.label parameter is misformed.');
  if (!parametres.check_port(props.port_externe))
    throw new ParameterMisformed(
      'The props.port_externe parameter is misformed.'
    );
  if (!parametres.check_port(props.port_interne))
    throw new ParameterMisformed(
      'The props.port_interne parameter is misformed.'
    );
  if (props.type !== SVC_TYPE.CLUSTERIP && props.type !== SVC_TYPE.LOADBALANCER)
    throw new ParameterMisformed('The props.type parameter is misformed.');
  if (!parametres.check_boolean(props.shutable))
    throw new ParameterMisformed('The props.shutable parameter is misformed.');

  const prefix = props.type === SVC_TYPE.CLUSTERIP ? 'ci' : 'lb';
  const typeStr =
    props.type === SVC_TYPE.CLUSTERIP ? 'ClusterIP' : 'LoadBalancer';
  const body = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: `${prefix}${props.label}${props.hash}${props.port_externe}`,
      namespace: `n${props.hash}`,
      labels: {
        type: 'Service',
        hash: `${props.hash}`,
        shutable: props.shutable ? 'true' : 'false',
      },
    },
    spec: {
      ports: [
        {
          port: props.port_interne,
          protocol: 'TCP',
        },
      ],
      //externalIPs: [`${CONFIG.master_ip}`],
      selector: {
        app: `${props.label}${props.hash}`,
      },
      sessionAffinity: 'ClientIP',
      type: `${typeStr}`,
    },
  };
  const url = `${CONFIG.kubernetes_url}/api/v1/namespaces/n${props.hash}/services`;
  return await Promise.resolve(fetch({ url, method: 'POST', body })).then(
    (res) => {
      return {
        result: res,
        type: 'Service',
        name: `${prefix}${props.label}${props.hash}${props.port_externe}`,
      };
    }
  );
};

/**
 * Private function that will fetch the Kubernetes API in order to get the name of the services attached to this hash.
 * @param {*} param0
 * @returns
 */
const get = async function (
  props = { hash: undefined, onlyShutable: true },
  fetch = kapi.fetch
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
    onlyShutable: true,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!parametres.check_boolean(props.onlyShutable))
    throw new ParameterMisformed(
      'The props.onlyShutable parameter is misformed.'
    );

  const url = `${CONFIG.kubernetes_url}/api/v1/namespaces/n${props.hash}/services?labelSelector=hash=${props.hash},shutable=${props.onlyShutable ? 'true' : 'false'}`;
  return await Promise.resolve(fetch({ url, method: 'GET' })).then((res) => {
    return {
      result: res.items.map((item) => item.metadata.name),
      type: 'Services',
      onlyShutable: props.onlyShutable,
    };
  });
};
/**
 * Private function that executes the deleteion of the service in the Kubernetes API.
 * @param {*} param0
 * @returns
 */
const del = async function (
  props = { name: undefined, hash: undefined },
  fetch = kapi.fetch
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    name: undefined,
    hash: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!parametres.check_libelle(props.name))
    throw new ParameterMisformed('The props.name parameter is misformed.');

  const url = `${CONFIG.kubernetes_url}/api/v1/namespaces/n${props.hash}/services/${props.name}`;
  return await Promise.resolve(fetch({ url, method: 'DELETE' })).then((res) => {
    return {
      result: res,
      type: 'Service',
      name: `${props.name}`,
    };
  });
};

const test_exports = {};
if (CONFIG.env === 'test') {
  test_exports.del = del;
  test_exports.get = get;
}
export { test_exports };
