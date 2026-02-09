import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../utils/errors.util.js';
import Guard from '../../utils/guard.util.js';

/**
 * Function used to delete the registryhub from Kubernetes cluster.
 * @param {*} param0
 * @returns
 */
export const deletion = async function (
  props = { hash: undefined },
  fetch = kapi.fetch
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');

  const url = `${CONFIG.KUBERNETES_URL}/api/v1/namespaces/n${props.hash}/secrets/registryhub`;
  return await Promise.resolve(fetch({ url, method: 'DELETE' })).then((res) => {
    return {
      result: res,
      type: 'RegistryHub',
      name: `registryhub`,
    };
  });
};

/**
 * Function used to create RegistryHub into the Kubernetes cluster.
 * @param {*} param0
 * @returns
 */
export const create = async function (
  props = { hash: undefined },
  fetch = kapi.fetch
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');

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
      namespace: `n${props.hash}`,
      labels: {
        type: 'RegistryHub',
        hash: `${props.hash}`,
      },
    },
    type: 'kubernetes.io/dockerconfigjson',
  };
  const url = `${CONFIG.KUBERNETES_URL}/api/v1/namespaces/n${props.hash}/secrets`;
  return await Promise.resolve(fetch({ url, method: 'POST', body })).then(
    (res) => {
      return {
        result: res,
        type: 'RegistryHub',
        name: `registryhub`,
      };
    }
  );
};
