import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import * as fs from 'fs/promises';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../utils/errors.service.js';
import Guard from '../../utils/guard.service.js';

/**
 * Function that will launch the creation of the ConfigMap into the Kubernets API.
 * @param {*} param0
 * @returns
 */
export const create = async function (
  props = {
    path: undefined,
    hash: undefined,
    namespace: undefined,
    filename: undefined,
    name: undefined,
    shutable: true,
  },
  fns = {
    fetch: kapi.fetch,
    readFile: fs.readFile,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    path: undefined,
    hash: undefined,
    namespace: undefined,
    filename: undefined,
    name: undefined,
    shutable: true,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!Guard.check_file_path(props.path))
    throw new ParameterMisformed('The props.path parameter is misformed.');
  if (!Guard.check_namespace(props.namespace))
    throw new ParameterMisformed('The props.namespace parameter is misformed.');
  if (!Guard.check_filename(props.filename))
    throw new ParameterMisformed('The props.filename parameter is misformed.');

  const data = await fns.readFile(props.path, 'utf8');
  const body = {
    apiVersion: 'v1',
    data: {
      [props.filename]: data,
    },
    metadata: {
      name: `${props.name}`,
      namespace: `${props.namespace}`,
      labels: {
        type: 'ConfigMap',
        hash: `${props.hash}`,
        shutable: props.shutable ? 'true' : 'false',
      },
    },
  };
  const url = `${CONFIG.KUBERNETES_URL}/api/v1/namespaces/${props.namespace}/configmaps`;
  return await Promise.resolve(fns.fetch({ url, method: 'POST', body })).then(
    (res) => {
      return {
        result: res,
        type: 'ConfigMap',
        name: `${props.name}`,
      };
    }
  );
};
/**
 * Function that will update the configmap in the kubernetes cluster.
 * @param {*} props
 * @param {*} fetch
 * @returns
 */
export const update = async function (
  props = {
    path: undefined,
    shutable: true,
    namespace: undefined,
    filename: undefined,
    name: undefined,
  },
  fns = {
    fetch: kapi.fetch,
    readFile: fs.readFile,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    path: undefined,
    namespace: undefined,
    filename: undefined,
    name: undefined,
    shutable: true,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_file_path(props.path))
    throw new ParameterMisformed('The props.path parameter is misformed.');
  if (!Guard.check_namespace(props.namespace))
    throw new ParameterMisformed('The props.namespace parameter is misformed.');
  if (!Guard.check_filename(props.filename))
    throw new ParameterMisformed('The props.filename parameter is misformed.');

  const data = await fns.readFile(props.path, 'utf8');
  const body = {
    data: {
      [props.filename]: data,
    },
    metadata: {
      name: `${props.name}`,
      namespace: `${props.namespace}`,
      labels: {
        type: 'ConfigMap',
        shutable: props.shutable ? 'true' : 'false',
      },
    },
  };
  const url = `${CONFIG.KUBERNETES_URL}/api/v1/namespaces/${props.namespace}/configmaps/${props.name}`;
  return await Promise.resolve(fns.fetch({ url, method: 'PUT', body })).then(
    (res) => {
      return res;
    }
  );
};
