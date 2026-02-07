import CONFIG from '../../config/config.js';
import * as kapi from '.././modules/kapi.module.js';
import * as parametres from '../../utils/parametres.service.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../utils/errors.service.js';

/**
 * Function that will create a network policy for a given namespace in cirrus namespace.
 * @param {*} param0
 * @returns
 */
export const create = async function (
  props = {
    hash: undefined,
  },
  fns = {
    fetch: kapi.fetch,
  }
) {
  const expected_props = {
    hash: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');

  // kapi request
  const body = {
    metadata: {
      name: `kubec-np-cirrus-kafka-from-n${props.hash}`,
      namespace: 'cirrus',
    },
    spec: {
      podSelector: {
        matchLabels: {
          app: 'cirrus-kafka',
        },
      },
      policyTypes: ['Ingress'],
      ingress: [
        {
          from: [
            {
              namespaceSelector: {
                matchLabels: {
                  'kubernetes.io/metadata.name': `n${props.hash}`,
                },
              },
            },
          ],
        },
      ],
    },
  };
  const url = `${CONFIG.kubernetes_url}/apis/networking.k8s.io/v1/namespaces/cirrus/networkpolicies`;
  return await Promise.resolve(fns.fetch({ url, method: 'POST', body })).then(
    (res) => {
      return {
        result: res,
        type: 'NetworkPolicy',
        name: `network-policy-${props.hash}`,
      };
    }
  );
};

/**
 * Function that will delete a network policy for a given namespace in cirrus namespace.
 * @param {*} param0
 * @returns
 */
export const deletion = async function (
  props = {
    hash: undefined,
  },
  fns = {
    fetch: kapi.fetch,
  }
) {
  const expected_props = {
    hash: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');

  const url = `${CONFIG.kubernetes_url}/apis/networking.k8s.io/v1/namespaces/cirrus/networkpolicies/kubec-np-cirrus-kafka-from-n${props.hash}`;
  return await Promise.resolve(fns.fetch({ url, method: 'DELETE' })).then(
    (res) => {
      return {
        result: res,
        type: 'NetworkPolicy',
        name: `network-policy-${props.hash}`,
      };
    }
  );
};
