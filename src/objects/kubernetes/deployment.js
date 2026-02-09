import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import * as parametres from '../../utils/parametres.service.js';
import { parsing_generic_tags } from '../../utils/parsing.service.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../utils/errors.service.js';

/**
 * Function that launch the deletion of the deployment.
 * @param {*} param0
 * @returns
 */
export const deletion = async function (
  props = { hash: undefined },
  fns = {
    get_deployment: get,
    delete_deployment: del,
  }
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

  const list = await Promise.resolve(
    fns.get_deployment({ hash: props.hash, onlyShutable: true })
  ).then((r) => {
    return r.result;
  });
  if (list.length === 0) return [];
  const promises = [];
  for (let i = 0; i < list.length; i++) {
    promises.push(fns.delete_deployment({ name: list[i], hash: props.hash }));
  }
  return await Promise.all(promises).then((r) => {
    return r;
  });
};
/**
 * Function that launch the scaling of the deployement.
 * @param {*} param0
 * @returns
 */
export const scale = async function (
  props = { hash: undefined, replicas: 0 },
  fns = { get_deployment: get, put_deployment: put }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
    replicas: 0,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!parametres.check_replica(props.replicas))
    throw new ParameterMisformed('The props.replicas parameter is misformed.');

  const list = await Promise.resolve(
    fns.get_deployment({ hash: props.hash, onlyShutable: true })
  ).then((r) => {
    return r.result;
  });
  if (list === 'Kubernetes is not activated.') return;
  const promises = [];
  for (let i = 0; i < list.length; i++) {
    promises.push(
      fns.put_deployment({
        name: list[i],
        hash: props.hash,
        replicas: props.replicas,
      })
    );
  }
  return await Promise.all(promises).then((r) => {
    return r;
  });
};
/**
 * Function that will launch the creation of the deployment in the kubernetes cluster.
 * @param {*} param0
 * @returns
 */
export const create = async function (
  props = {
    hash: undefined,
    image: undefined,
    image_tag: undefined,
    username: undefined,
    password: undefined,
    service_command: undefined,
    label: undefined,
    web_title: undefined,
    ports: [],
    envs: [],
    args: [],
    privileged: undefined,
    generated_label: undefined,
    has_storage: false,
    readiness_probe_initial_delay: undefined,
    liveness_probe_initial_delay: undefined,
    readiness_probe_period: undefined,
    liveness_probe_period: undefined,
    need_compute_gpu: undefined,
    need_graphical_rendering_gpu: undefined,
    ram_limit: undefined,
    ram_request: undefined,
    cpu_request: undefined,
    cpu_limit: undefined,
    node_selectors: [],
  },
  fetch = kapi.fetch
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
    image: undefined,
    image_tag: undefined,
    username: undefined,
    password: undefined,
    service_command: undefined,
    label: undefined,
    web_title: undefined,
    ports: [],
    envs: [],
    args: [],
    generated_label: undefined,
    has_storage: false,
    readiness_probe_initial_delay: undefined,
    liveness_probe_initial_delay: undefined,
    readiness_probe_period: undefined,
    liveness_probe_period: undefined,
    need_compute_gpu: undefined,
    need_graphical_rendering_gpu: undefined,
    ram_limit: undefined,
    ram_request: undefined,
    cpu_request: undefined,
    cpu_limit: undefined,
    node_selectors: [],
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );

  // La requête
  let body = {
    metadata: {
      name: `${props.label}${props.hash}`,
      namespace: `n${props.hash}`,
      labels: {
        app: `${props.label}${props.hash}`,
        type: 'Deployment',
        hash: `${props.hash}`,
        shutable: 'true',
      },
    },
    spec: {
      replicas: 1,
      automountServiceAccountToken: false,
      selector: {
        matchLabels: {
          app: `${props.label}${props.hash}`,
        },
      },
      template: {
        metadata: {
          labels: {
            app: `${props.label}${props.hash}`,
            type: 'Deployment',
            hash: `${props.hash}`,
          },
          name: `${props.label}${props.hash}`,
          namespace: `n${props.hash}`,
        },
        spec: {
          containers: [
            {
              name: `pod${props.label}${props.hash}`,
              image: `${props.image}:${props.image_tag}`,
              imagePullPolicy: 'IfNotPresent',
              readinessProbe: {
                exec: {
                  command: ['/bin/sh', '/var/probe.sh'],
                },
                initialDelaySeconds: props.readiness_probe_initial_delay,
                periodSeconds: props.readiness_probe_period,
              },
              livenessProbe: {
                exec: {
                  command: ['/bin/sh', '/var/probe.sh'],
                },
                initialDelaySeconds: props.liveness_probe_initial_delay,
                periodSeconds: props.liveness_probe_period,
              },
              resources: {
                limits: {
                  cpu: props.cpu_limit,
                  memory: props.ram_limit,
                },
                requests: {
                  cpu: props.cpu_request,
                  memory: props.ram_request,
                },
              },
            },
          ],
          imagePullSecrets: [
            {
              name: 'registryhub',
            },
          ],
        },
      },
    },
  };

  // Adding GPU configs
  if (props.need_compute_gpu) body = add_compute_gpu({ body });

  // Ajout de node_selectors
  body = add_node_selectors({ body, node_selectors: props.node_selectors });

  // Ajout de Service_commands
  body = add_service_commands({
    body,
    service_command: props.service_command,
  });

  // Ajout de Arguments
  body = add_arguments({
    body,
    args: props.args,
    hash: props.hash,
    username: props.username,
    password: props.password,
    label: props.label,
    target: props.target,
    generated_label: props.generated_label,
    web_title: props.web_title,
  });

  // Ajout de Ports
  body = add_ports({ body, ports: props.ports });

  // Ajout de Var_Envs
  body = add_envs({
    body,
    envs: props.envs,
    hash: props.hash,
    username: props.username,
    password: props.password,
    label: props.label,
    target: props.target,
    generated_label: props.generated_label,
    web_title: props.web_title,
  });

  // Ajout des volumes
  body = add_storage({
    body: body,
    username: props.username,
    label: props.label,
    hash: props.hash,
    has_storage: props.has_storage,
  });

  const url = `${CONFIG.KUBERNETES_URL}/apis/apps/v1/namespaces/n${props.hash}/deployments`;
  return await Promise.resolve(fetch({ url, method: 'POST', body })).then(
    (res) => {
      return {
        result: res,
        type: 'Deployment',
        name: `${props.label}${props.hash}`,
      };
    }
  );
};
/**
 * Private function that will add the node_selectors part to the body.
 * @param {*} param0
 * @returns
 */
const add_node_selectors = function (
  props = { body: undefined, node_selectors: [] }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    node_selectors: [],
    body: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (props.body?.spec?.template?.spec === undefined)
    throw new ParameterMisformed('The props.body parameter is misformed.');
  props.body.spec.template.spec = {
    ...props.body.spec.template.spec,
    affinity: {
      nodeAffinity: {
        requiredDuringSchedulingIgnoredDuringExecution: {
          nodeSelectorTerms: [],
        },
      },
    },
  };
  // NODESELECTOR : We reunite all the value with the same key in the same array.
  const united = [];
  for (let ns of props.node_selectors) {
    if (united.filter((item) => item.key === ns.key).length === 0) {
      united.push({
        key: ns.key,
        values: [ns.value],
      });
    } else {
      united.filter((item) => item.key === ns.key)[0].values.push(ns.value);
    }
  }

  // adding the reunited data to the body
  if (united.length !== 0) {
    for (let ns = 0; ns < united.length; ns++) {
      props.body.spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.push(
        {
          matchExpressions: [
            {
              key: `${united[ns].key}`,
              operator: 'In',
              values: [],
            },
          ],
        }
      );
      for (let v of united[ns].values) {
        props.body.spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[
          ns
        ].matchExpressions[0].values.push(`${v}`);
      }
    }
  }
  return props.body;
};

/**
 * Private function that will add the service commands part to the body.
 * @param {*} param0
 * @returns
 */
const add_service_commands = function (
  props = {
    service_command: '',
    body: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    service_command: '',
    body: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (props?.body?.spec?.template?.spec?.containers === undefined)
    throw new ParameterMisformed('The props.body parameter is misformed.');
  if (props.service_command === '') return props.body;
  props.body.spec.template.spec.containers[0].command = [];
  for (let sc of props.service_command.split(' ')) {
    props.body.spec.template.spec.containers[0].command.push(`${sc}`);
  }
  return props.body;
};

/**
 * Private function that will add arguments to the body object.
 * @param {*} param0
 * @returns
 */
const add_arguments = function (
  props = {
    args: [],
    hash: '',
    generated_label: '',
    username: '',
    password: '',
    label: '',
    body: undefined,
    web_title: undefined,
    target: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    args: [],
    hash: undefined,
    generated_label: undefined,
    username: undefined,
    password: undefined,
    label: undefined,
    body: undefined,
    web_title: undefined,
    target: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (props.args.length === 0) return props.body;
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!parametres.check_libelle(props.label, 3))
    throw new ParameterMisformed('The props.label parameter is misformed.');
  if (!parametres.check_libelle(props.generated_label))
    throw new ParameterMisformed(
      'The props.generated_label parameter is misformed.'
    );
  if (!parametres.check_libelle(props.username))
    throw new ParameterMisformed('The props.username parameter is misformed.');
  if (props?.body?.spec?.template?.spec?.containers === undefined)
    throw new ParameterMisformed('The props.body parameter is misformed.');

  props.body.spec.template.spec.containers[0].args = [];
  props.args.forEach((arg) => {
    props.body.spec.template.spec.containers[0].args.push(
      parsing_generic_tags(arg.value, {
        hash: props.hash,
        username: props.username,
        password: props.password,
        label: props.label,
        target: props.target,
        generated_label: props.generated_label,
        web_title: props.web_title,
      })
    );
  });

  return props.body;
};

/**
 * Private function that will add ports part to the body object.
 * @param {*} param0
 * @returns
 */
const add_ports = function (props = { ports: [], body: undefined }) {
  // We check all mandatory props before doing anything
  const expected_props = {
    ports: [],
    body: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (props?.body?.spec?.template?.spec?.containers === undefined)
    throw new ParameterMisformed('The props.body parameter is misformed.');

  if (props.ports.length === 0) return props.body;
  for (const element of props.ports) {
    if (!parametres.check_port(element.port)) {
      throw new ParameterMisformed('One of the port is not a Number.');
    }
  }

  props.body.spec.template.spec.containers[0].ports = [];
  for (const element of props.ports) {
    props.body.spec.template.spec.containers[0].ports.push({
      containerPort: element.port,
      protocol: 'TCP',
    });
  }
  return props.body;
};

/**
 * Private function that will add envs part to the body object.
 * @param {*} param0
 * @returns
 */
const add_envs = function (
  props = {
    body: undefined,
    envs: [],
    hash: '',
    username: '',
    password: '',
    label: '',
    generated_label: '',
    web_title: '',
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    body: undefined,
    envs: [],
    hash: undefined,
    username: undefined,
    password: undefined,
    label: undefined,
    generated_label: undefined,
    web_title: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (props.envs.length === 0) return props.body;
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!parametres.check_libelle(props.label, 3))
    throw new ParameterMisformed('The props.label parameter is misformed.');
  if (!parametres.check_libelle(props.generated_label))
    throw new ParameterMisformed(
      'The props.generated_label parameter is misformed.'
    );
  if (!parametres.check_libelle(props.username))
    throw new ParameterMisformed('The props.username parameter is misformed.');
  if (props?.body?.spec?.template?.spec?.containers === undefined)
    throw new ParameterMisformed('The props.body parameter is misformed.');

  props.body.spec.template.spec.containers[0].env = [];
  props.body.spec.template.spec.containers[0].env.push(
    ...props.envs.map((env) => ({
      name: env.key,
      value: parsing_generic_tags(env.value, {
        hash: props.hash,
        username: props.username,
        password: props.password,
        label: props.label,
        target: props.target,
        generated_label: props.generated_label,
        web_title: props.web_title,
      }),
    }))
  );

  return props.body;
};

/**
 * Private functions that add GPU compute process in the deployment.
 * @param {*} props
 */
const add_compute_gpu = function (
  props = {
    body: undefined,
  }
) {
  props.body.spec.template.spec.runtimeClassName = 'nvidia';
  props.body.spec.template.spec.containers[0].resources.limits[
    'nvidia.com/gpu'
  ] = 1;
  return props.body;
};

/**
 * Private function that will add storage part to the body object.
 * @param {*} param0
 * @returns
 */
const add_storage = function (
  props = {
    body: undefined,
    username: undefined,
    label: undefined,
    hash: undefined,
    has_storage: false,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    username: undefined,
    label: undefined,
    hash: undefined,
    has_storage: false,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!parametres.check_libelle(props.label, 3))
    throw new ParameterMisformed('The props.label parameter is misformed.');
  if (!parametres.check_libelle(props.username))
    throw new ParameterMisformed('The props.username parameter is misformed.');
  if (!parametres.check_boolean(props.has_storage))
    throw new ParameterMisformed('The props.has_storage must be a boolean.');
  if (props?.body?.spec?.template?.spec?.containers === undefined)
    throw new ParameterMisformed('The props.body parameter is misformed.');

  if (!props.has_storage) return props.body;

  if (CONFIG.KUBERNETES_VOLUME_TYPE === 'Block') {
    props.body.spec.template.spec.containers[0].volumeDevices = [];
    props.body.spec.template.spec.containers[0].volumeDevices.push({
      devicePath: `/home/${props.username}`,
      name: `${props.label}${props.hash}-pvc`,
    });
  } else {
    props.body.spec.template.spec.containers[0].volumeMounts = [];
    props.body.spec.template.spec.containers[0].volumeMounts.push({
      mountPath: `/home/${props.username}`,
      name: `${props.label}${props.hash}-pvc`,
    });
  }
  props.body.spec.template.spec.volumes = [];
  props.body.spec.template.spec.volumes.push({
    name: `${props.label}${props.hash}-pvc`,
    persistentVolumeClaim: {
      claimName: `${props.label}${props.hash}-pvc`,
    },
  });
  return props.body;
};

/**
 * Private function that will fetch the Kubernetes API to get the deployment object.
 * @param {*} param0
 * @returns
 */
const get = async function (
  props = { hash: undefined, onlyShutable: false },
  fetch = kapi.fetch
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
    onlyShutable: false,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');

  const url = `${CONFIG.KUBERNETES_URL}/apis/apps/v1/namespaces/n${props.hash}/deployments?labelSelector=type=Deployment,hash=${props.hash},shutable=${props.onlyShutable ? 'true' : 'false'}`;
  return await Promise.resolve(fetch({ url, method: 'GET' })).then((res) => {
    if (res === 'Kubernetes is not activated.') return { result: res };
    return {
      result: res.items.map((item) => item.metadata.name),
      type: 'Deployments',
      onlyShutable: props.onlyShutable,
    };
  });
};

/**
 * Private function that will execute the deletion of the deployment in the Kubernetes cluster.
 * @param {*} param0
 * @returns
 */
const del = async function (
  props = { name: undefined, hash: undefined },
  fetch = kapi.fetch
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    name: undefined,
    hash: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!parametres.check_libelle(props.name))
    throw new ParameterMisformed('The props.name parameter is misformed.');

  const url = `${CONFIG.KUBERNETES_URL}/apis/apps/v1/namespaces/n${props.hash}/deployments/${props.name}`;
  return await Promise.resolve(fetch({ url, method: 'DELETE' })).then((res) => {
    return {
      result: res,
      type: 'Deployment',
      name: `${props.name}`,
    };
  });
};

/**
 * Private function that will execute the update of the scale on the Kubernetes API.
 * @param {*} param0
 * @returns
 */
const put = async function (
  props = { name: undefined, hash: undefined, replicas: 1 },
  fetch = kapi.fetch
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    name: undefined,
    hash: undefined,
    replicas: 1,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!parametres.check_libelle(props.name))
    throw new ParameterMisformed('The props.name parameter is misformed.');

  const body = {
    kind: 'Scale',
    apiVersion: 'autoscaling/v1',
    metadata: {
      name: `${props.name}`,
      namespace: `n${props.hash}`,
    },
    spec: {
      replicas: props.replicas,
    },
  };
  const url = `${CONFIG.KUBERNETES_URL}/apis/apps/v1/namespaces/n${props.hash}/deployments/${props.name}/scale`;
  return await Promise.resolve(fetch({ url, body, method: 'PUT' })).then(
    (res) => {
      return {
        result: res,
        type: 'Deployment',
        name: `${props.name}`,
      };
    }
  );
};

const test_exports = {};
if (CONFIG.APP_ENVIRONMENT === 'test') {
  test_exports.add_node_selectors = add_node_selectors;
  test_exports.add_service_commands = add_service_commands;
  test_exports.add_arguments = add_arguments;
  test_exports.add_ports = add_ports;
  test_exports.add_envs = add_envs;
  test_exports.add_storage = add_storage;
  test_exports.add_compute_gpu = add_compute_gpu;
  test_exports.get = get;
  test_exports.del = del;
  test_exports.put = put;
}
export { test_exports };
