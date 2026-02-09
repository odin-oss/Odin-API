import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../utils/errors.service.js';
import * as parametres from '../../utils/parametres.service.js';

/**
 * Function that executes the deletion of all the externalname contained in the cirrus namespace and the match the hash.
 * @param {*} props
 * @param {*} fns Functions that can be overwrote during tests execution.
 * @returns
 */
export const deletion = async function (
  props = { hash: undefined },
  fns = { get: get, delete: del }
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

  const list = await Promise.resolve(fns.get({ hash: props.hash })).then(
    (r) => {
      return r.result;
    }
  );
  if (list === 'Kubernetes is not activated.') return;
  const promises = list.map((name) => fns.delete({ name }));
  return await Promise.all(promises).then((r) => {
    return r;
  });
};

/**
 * Function that executes the creation of an externalname in the cirrus namespace on Kubernetes.
 * @param {*} props
 * @param {*} fetch Spy on test execution, else it will execute the kapi.fetch.
 * @returns
 */
export const create = async function (
  props = {
    hash: undefined,
    label: undefined,
    port_externe: undefined,
  },
  fetch = kapi.fetch
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
    label: undefined,
    port_externe: undefined,
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

  const body = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: `ci${props.label}${props.hash}${props.port_externe}-proxy`,
      namespace: 'cirrus',
      labels: {
        type: 'ExternalName',
        hash: `${props.hash}`,
        shutable: 'true',
      },
    },
    spec: {
      externalName: `ci${props.label}${props.hash}${props.port_externe}.n${props.hash}.svc.cluster.local`,
      ports: [
        {
          port: props.port_externe,
          protocol: 'TCP',
        },
      ],
      type: 'ExternalName',
    },
  };
  const url = `${CONFIG.KUBERNETES_URL}/api/v1/namespaces/cirrus/services`;
  return await Promise.resolve(fetch({ url, method: 'POST', body })).then(
    (res) => {
      return {
        result: res,
        type: 'ExternalName',
        name: `ci${props.label}${props.hash}${props.port_externe}-proxy`,
      };
    }
  );
};

/**
 * Private function that will fetch the KAPI.
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

  const url = `${CONFIG.KUBERNETES_URL}/api/v1/namespaces/cirrus/services?labelSelector=type=ExternalName,hash=${props.hash},shutable=${{ ...expected_props, ...props }.onlyShutable ? 'true' : 'false'}`;

  return await Promise.resolve(fetch({ url, method: 'GET' })).then((res) => {
    if (res === 'Kubernetes is not activated.') return { result: res };
    return {
      result: res?.items.map((item) => item.metadata.name),
      type: 'ExternalName',
    };
  });
};
/**
 * Private function that will fetch the KAPI to delete an external name from cluster.
 * @param {*} param0
 * @returns
 */
const del = async function (props = { name: undefined }, fetch = kapi.fetch) {
  // We check all mandatory props before doing anything
  const expected_props = {
    name: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_libelle(props.name))
    throw new ParameterMisformed('The props.name parameter is misformed.');

  const url = `${CONFIG.KUBERNETES_URL}/api/v1/namespaces/cirrus/services/${props.name}`;
  return await Promise.resolve(fetch({ url, method: 'DELETE' })).then((res) => {
    return {
      result: res,
      type: 'ExternalName',
      name: `${props.name}`,
    };
  });
};

const test_exports = {};
if (CONFIG.APP_ENVIRONMENT === 'test') {
  test_exports.del = del;
  test_exports.get = get;
}
export { test_exports };
