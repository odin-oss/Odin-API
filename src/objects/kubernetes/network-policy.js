import z from 'zod';
import * as kapi from '../../modules/kapi.module.js';
import logs from '../../middlewares/winston.js';
import Guard from '../../utils/guard.util.js';

/**
 * Function that will create a network policy for a given namespace in odin namespace. (to be deprecated)
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
      name: `kubec-np-odin-kafka-from-n${data.hash}`,
      namespace: 'odin',
    },
    spec: {
      podSelector: {
        matchLabels: {
          app: 'odin-kafka',
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
  const url = `/apis/networking.k8s.io/v1/namespaces/odin/networkpolicies`;
  return await fns
    .fetch({ url, method: 'POST', body })
    .then((res) => ({
      result: res,
      type: 'NetworkPolicy',
      name: `network-policy-${data.hash}`,
    }))
    .catch(logs.debug);
};

/**
 * Function that will delete a network policy for a given namespace in odin namespace.
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
  const url = `/apis/networking.k8s.io/v1/namespaces/odin/networkpolicies/kubec-np-odin-kafka-from-n${data.hash}`;
  return await fns.fetch({ url, method: 'DELETE' }).then((res) => ({
    result: res,
    type: 'NetworkPolicy',
    name: `network-policy-${data.hash}`,
  }));
};
