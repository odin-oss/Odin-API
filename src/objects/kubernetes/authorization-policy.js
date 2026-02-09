import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../utils/errors.util.js';
import Guard from '../../utils/guard.util.js';

/**
 * Function that will create an istio authorization policy for a given namespace in cirrus namespace.
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
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');

  // kapi request
  const body = {
    kind: 'AuthorizationPolicy',
    apiVersion: 'security.istio.io/v1',
    metadata: {
      name: `istio-ap-cirrus-kafka-n${props.hash}`,
      namespace: 'cirrus',
    },
    spec: {
      action: 'ALLOW',
      selector: {
        matchLabels: {
          app: 'cirrus-kafka',
        },
      },
      rules: [
        {
          from: [
            {
              source: {
                namespaces: [`n${props.hash}`],
              },
            },
          ],
          to: [
            {
              operation: {
                ports: ['9092'],
              },
            },
          ],
        },
      ],
    },
  };
  const url = `${CONFIG.KUBERNETES_URL}/apis/security.istio.io/v1/namespaces/cirrus/authorizationpolicies`;
  return await Promise.resolve(fns.fetch({ url, method: 'POST', body })).then(
    (res) => {
      return {
        result: res,
        type: 'AuthorizationPolicy',
        name: `authorization-policy-${props.hash}`,
      };
    }
  );
};

/**
 * Function that will delete an istio authorization policy for a given namespace in cirrus namespace.
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
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');

  // kapi request
  const url = `${CONFIG.KUBERNETES_URL}/apis/security.istio.io/v1/namespaces/cirrus/authorizationpolicies/istio-ap-cirrus-kafka-n${props.hash}`;
  return await Promise.resolve(fns.fetch({ url, method: 'DELETE' })).then(
    (res) => {
      return {
        result: res,
        type: 'AuthorizationPolicy',
        name: `authorization-policy-${props.hash}`,
      };
    }
  );
};
