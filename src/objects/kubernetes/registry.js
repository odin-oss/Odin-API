import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../utils/errors.service.js';
import * as parametres from '../../utils/parametres.service.js';

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
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');

  const url = `${CONFIG.kubernetes_url}/api/v1/namespaces/n${props.hash}/secrets/registryhub`;
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
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');

  const data = {
    auths: {
      [CONFIG.registry_url]: {
        username: CONFIG.registry_username,
        password: CONFIG.registry_password,
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
  const url = `${CONFIG.kubernetes_url}/api/v1/namespaces/n${props.hash}/secrets`;
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
