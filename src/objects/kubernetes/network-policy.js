import z from 'zod';
import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../utils/errors.util.js';
import Guard from '../../utils/guard.util.js';

/**
 * Function that will create a network policy for a given namespace in cirrus namespace.
 * @param {String} hash unique hash to identify specific network policy resources.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const create = async function (
  props,
  fns = {
    fetch: kapi.fetch,
  }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  // kapi request
  const body = {
    metadata: {
      name: `kubec-np-cirrus-kafka-from-n${data.hash}`,
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
                  'kubernetes.io/metadata.name': `n${data.hash}`,
                },
              },
            },
          ],
        },
      ],
    },
  };
  const url = `/apis/networking.k8s.io/v1/namespaces/cirrus/networkpolicies`;
  return await fns.fetch({ url, method: 'POST', body }).then((res) => ({
    result: res,
    type: 'NetworkPolicy',
    name: `network-policy-${data.hash}`,
  }));
};

/**
 * Function that will delete a network policy for a given namespace in cirrus namespace.
 * @param {String} hash unique hash to identify specific external name resources.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const deletion = async function (
  props,
  fns = {
    fetch: kapi.fetch,
  }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  const url = `/apis/networking.k8s.io/v1/namespaces/cirrus/networkpolicies/kubec-np-cirrus-kafka-from-n${data.hash}`;
  return await fns.fetch({ url, method: 'DELETE' }).then((res) => ({
    result: res,
    type: 'NetworkPolicy',
    name: `network-policy-${data.hash}`,
  }));
};
