import z from 'zod';
import * as kapi from '../../modules/kapi.module.js';
import Guard from '../../utils/guard.util.js';
import logs from '../../middlewares/winston.js';

/**
 * Function that will create an istio authorization policy for a given namespace in odin namespace.
 * @param {String} hash unique hash to identify the authorization policy in the cluster.
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
  const body = {
    kind: 'AuthorizationPolicy',
    apiVersion: 'security.istio.io/v1',
    metadata: {
      name: `istio-ap-odin-kafka-n${data.hash}`,
      namespace: 'odin',
    },
    spec: {
      action: 'ALLOW',
      selector: {
        matchLabels: {
          app: 'odin-kafka',
        },
      },
      rules: [
        {
          from: [
            {
              source: {
                namespaces: [`n${data.hash}`],
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
  const url = `/apis/security.istio.io/v1/namespaces/odin/authorizationpolicies`;
  return await fns
    .fetch({ url, method: 'POST', body })
    .then((res) => ({
      result: res,
      type: 'AuthorizationPolicy',
      name: `authorization-policy-${data.hash}`,
    }))
    .catch(logs.debug);
};

/**
 * Function that will delete an istio authorization policy for a given namespace in odin namespace.
 * @param {String} hash hash to identify the authorization policy in the cluster.
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
  const url = `/apis/security.istio.io/v1/namespaces/odin/authorizationpolicies/istio-ap-odin-kafka-n${data.hash}`;
  return await fns.fetch({ url, method: 'DELETE' }).then((res) => ({
    result: res,
    type: 'AuthorizationPolicy',
    name: `authorization-policy-${data.hash}`,
  }));
};
