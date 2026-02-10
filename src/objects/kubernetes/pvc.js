import z from 'zod';
import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import Guard from '../../utils/guard.util.js';

/**
 * Function that will launch the whole creation of storage part in the kubernetes cluster (only pvc)
 * @param {String} hash unique hash to identify specific external name resources.
 * @param {String} label label of the application.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const create = async function (
  props,
  fns = {
    execute_creation: execute_creation,
  }
) {
  const schema = z.object({
    hash: z.string().min(8).max(8),
    label: z.string()
  });
  const data = Guard.validateProps(schema, props);
  return await fns.execute_creation({ ...data })
    .then((res) => {
      return {
        result: res,
        type: 'PVC',
        name: `${data.label}${data.hash}-pvc`,
      };
    });
};

/**
 * This function is executing the creation of the PVC object in the Kubernetes cluster.
 * @param {String} hash unique hash to identify specific external name resources.
 * @param {String} label label of the application.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
const execute_creation = async function (
  props,
  fetch = kapi.fetch
) {
  const schema = z.object({
    hash: z.string().min(8).max(8),
    label: z.string()
  });
  const data = Guard.validateProps(schema, props);

  const body = {
    metadata: {
      name: `${data.label}${data.hash}-pvc`,
      namespace: `n${data.hash}`,
      labels: {
        type: 'PVC',
        hash: `${data.hash}`,
        shutable: 'false',
      },
    },
    spec: {
      accessModes: ['ReadWriteOnce'],
      resources: {
        requests: {
          storage: '1Gi',
        },
      },
      //storageClassName: 'csi-cinder-high-speed-gen2',
      storageClassName: CONFIG.KUBERNETES_STORAGE_CLASSNAME,
    },
  };
  if (CONFIG.KUBERNETES_VOLUME_TYPE === 'Block') {
    body.spec.volumeMode = 'Block';
  }
  const url = `${CONFIG.KUBERNETES_URL}/api/v1/namespaces/n${data.hash}/persistentvolumeclaims`;
  return await fetch({ url, method: 'POST', body }).then(
    (res) => ({
      type: 'PersistentVolumeClaim',
      name: `${data.label}${data.hash}-pvc`,
      result: res,
    })
  );
};

const test_exports = {};
if (CONFIG.APP_ENVIRONMENT === 'test') {
  test_exports.execute_creation = execute_creation;
}
export { test_exports };
