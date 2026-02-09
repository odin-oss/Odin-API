import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
//import * as service from '../../objects/service.js';
//import * as configmap from '../../objects/configmap.js';
import * as parametres from '../../utils/parametres.service.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../utils/errors.service.js';

/**
 * Function that will launch the whole creation of storage part in the kubernetes cluster (only pvc)
 * @param {*} param0
 * @returns
 */
export const create = async function (
  props = { hash: undefined, label: undefined },
  fns = {
    execute_creation: execute_creation,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
    label: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!parametres.check_libelle(props.label, 3))
    throw new ParameterMisformed('The props.label parameter is misformed.');

  return await Promise.resolve(
    fns.execute_creation({ hash: props.hash, label: props.label })
  ).then((res) => {
    return {
      result: res,
      type: 'PVC',
      name: `${props.label}${props.hash}-pvc`,
    };
  });
};
/**
 * This function is executing the creation of the PVC object in the Kubernetes cluster.
 * @param {*} props {label, hash}
 * @param {*} fetch spy on test execution, else will be executed by kapi fetch
 * @returns
 */
const execute_creation = async function (
  props = { label: undefined, hash: undefined },
  fetch = kapi.fetch
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
    label: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!parametres.check_libelle(props.label, 3))
    throw new ParameterMisformed('The props.label parameter is misformed.');

  const body = {
    metadata: {
      name: `${props.label}${props.hash}-pvc`,
      namespace: `n${props.hash}`,
      labels: {
        type: 'PVC',
        hash: `${props.hash}`,
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
  const url = `${CONFIG.KUBERNETES_URL}/api/v1/namespaces/n${props.hash}/persistentvolumeclaims`;
  return await Promise.resolve(fetch({ url, method: 'POST', body })).then(
    (res) => {
      return {
        type: 'PersistentVolumeClaim',
        name: `${props.label}${props.hash}-pvc`,
        result: res,
      };
    }
  );
};

const test_exports = {};
if (CONFIG.APP_ENVIRONMENT === 'test') {
  test_exports.execute_creation = execute_creation;
}
export { test_exports };
