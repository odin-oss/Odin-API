import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import { parsing_generic_tags } from '../../utils/parsing.util.js';
import { ParameterMisformed } from '../../utils/errors.util.js';
import Guard from '../../utils/guard.util.js';
import z from 'zod';
import Port from '../Port.js';
import VariableEnvironment from '../Variable_environment.js';
import Argument from '../Argument.js';
import NodeSelector from '../NodeSelector.js';
import logger from '../../middlewares/winston.js';

/**
 * Function that launch the deletion of the deployment.
 * @param {String} hash unique hash to identify the deploy in the cluster.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const deletion = async function (
  props,
  fns = {
    get_deployment: get,
    delete_deployment: del,
  }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  const list = await fns.get_deployment({ ...data }).then((r) => r.result);
  if (list.length === 0) return [];
  const promises = [];
  for (let deploy of list) {
    promises.push(fns.delete_deployment({ ...data, name: deploy }));
  }
  return await Promise.all(promises);
};
/**
 * Function that launch the scaling of the deployement.
 * @param {String} hash unique hash to identify the deploy in the cluster.
 * @param {String} replicas how many replicas of pods to deploy.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const scale = async function (
  props,
  fns = { get_deployment: get, put_deployment: put }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
    replicas: z.number().int().default(0),
  });
  const data = Guard.validateProps(schema, props);
  const list = await fns.get_deployment({ ...data }).then((r) => r.result);
  if (list === 'Kubernetes is not activated.') return;
  const promises = [];
  for (let deploy of list) {
    promises.push(
      fns.put_deployment({
        name: deploy,
        hash: data.hash,
        replicas: data.replicas,
      })
    );
  }
  return await Promise.all(promises);
};
/**
 * Function that will launch the creation of the deployment in the kubernetes cluster.
 * @param {String} hash unique hash to identify the deploy in the cluster.
 * @param {String} registry_link image of the container in the registry.
 * @param {String} username username of the application.
 * @param {String} password password of the application.
 * @param {String} service_command service_command of the container.
 * @param {String} label label of the application.
 * @param {String} ports list of all the ports to open on the container.
 * @param {String} envs list of all the env vars to set in the container.
 * @param {String} args list of all the arguments container.
 * @param {String} node_selectors list of all the node selectors to set - for affinity in kubernetes cluster.
 * @param {String} generated_label generated label for application.
 * @param {String} has_storage do we have to set a block storage volume on this container.
 * @param {String} readiness_probe_initial_delay delay before first readiness probe execution.
 * @param {String} liveness_probe_initial_delay delay before first liveness probe execution.
 * @param {String} readiness_probe_period period between two readiness probe execution.
 * @param {String} liveness_probe_period period between two readiness probe execution.
 * @param {String} need_compute_gpu do we passthrough compute GPU.
 * @param {String} need_graphical_rendering_gpu do we passthrough rendering GPU.
 * @param {String} ram_limit limit of RAM the container can reach.
 * @param {String} ram_request amount of RAM to reserve for this container.
 * @param {String} cpu_limit limit of CPU the container can reach.
 * @param {String} cpu_request amount of CPU to reserve for this container.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const create = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
    registry_link: z.string().transform((val) => {
      const parts = val.split(':');
      if (parts.length !== 2) {
        throw new z.ZodError(
          "The registry link should be in the format 'image:image_tag'."
        );
      }
      return {
        image: parts[0],
        image_tag: parts[1],
      };
    }),
    username: z.string(),
    password: z.string(),
    service_command: z.string(),
    label: z.string(),
    ports: z.array(z.lazy(() => z.instanceof(Port))).default([]),
    envs: z.array(z.lazy(() => z.instanceof(VariableEnvironment))).default([]),
    args: z.array(z.lazy(() => z.instanceof(Argument))).default([]),
    node_selectors: z
      .array(z.lazy(() => z.instanceof(NodeSelector)))
      .default([]),
    generated_label: z.string(),
    has_storage: z.boolean(),
    readiness_probe_initial_delay: z.coerce
      .number()
      .int()
      .positive()
      .default(10),
    liveness_probe_initial_delay: z.coerce
      .number()
      .int()
      .positive()
      .default(10),
    readiness_probe_period: z.coerce.number().int().positive().default(10),
    liveness_probe_period: z.coerce.number().int().positive().default(10),
    need_compute_gpu: z.boolean().default(false),
    need_graphical_rendering_gpu: z.boolean().default(false),
    ram_limit: z.string(),
    ram_request: z.string(),
    cpu_request: z.string(),
    cpu_limit: z.string(),
    egress_bandwidth: z
      .string({ invalid_type_error: 'The bandwidth must be sent in string.' })
      .regex(/^\d+[MG]$/, {
        message:
          'The bandwidth should be like xxM or xxG, xx being your number value.',
      })
      .default('10M'),
    ingress_bandwidth: z
      .string({ invalid_type_error: 'The bandwidth must be sent in string.' })
      .regex(/^\d+[MG]$/, {
        message:
          'The bandwidth should be like xxM or xxG, xx being your number value.',
      })
      .default('10M'),
  });
  const data = Guard.validateProps(schema, props);
  let body = {
    metadata: {
      name: `${data.label}${data.hash}`,
      namespace: `n${data.hash}`,
      labels: {
        app: `${data.label}${data.hash}`,
        type: 'Deployment',
        hash: `${data.hash}`,
        shutable: 'true',
      },
    },
    spec: {
      replicas: 1,
      automountServiceAccountToken: false,
      selector: {
        matchLabels: {
          app: `${data.label}${data.hash}`,
        },
      },
      template: {
        metadata: {
          labels: {
            app: `${data.label}${data.hash}`,
            type: 'Deployment',
            hash: `${data.hash}`,
          },
          name: `${data.label}${data.hash}`,
          namespace: `n${data.hash}`,
          annotations: {
            'kubernetes.io/ingress-bandwidth': data.ingress_bandwidth,
            'kubernetes.io/egress-bandwidth': data.egress_bandwidth,
          },
        },
        spec: {
          securityContext: {
            runAsUser: 1000,
            runAsGroup: 1000,
            fsGroup: 1000,
          },
          containers: [
            {
              name: `pod${data.label}${data.hash}`,
              image: `${data.registry_link.image}:${data.registry_link.image_tag}`,
              imagePullPolicy: 'IfNotPresent',
              readinessProbe: {
                exec: {
                  command: ['/bin/sh', '/var/probe.sh'],
                },
                initialDelaySeconds: data.readiness_probe_initial_delay,
                periodSeconds: data.readiness_probe_period,
              },
              livenessProbe: {
                exec: {
                  command: ['/bin/sh', '/var/probe.sh'],
                },
                initialDelaySeconds: data.liveness_probe_initial_delay,
                periodSeconds: data.liveness_probe_period,
              },
              resources: {
                limits: {
                  cpu: data.cpu_limit,
                  memory: data.ram_limit,
                },
                requests: {
                  cpu: data.cpu_request,
                  memory: data.ram_request,
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
  try {
    if (data.need_compute_gpu) body = add_compute_gpu({ body });
    body = add_node_selectors({ body, node_selectors: data.node_selectors });
    body = add_service_commands({
      body,
      service_command: data.service_command,
    });
    body = add_arguments({
      body,
      args: data.args,
      hash: data.hash,
      username: data.username,
      password: data.password,
      label: data.label,
      target: data.target,
      generated_label: data.generated_label,
    });
    body = add_ports({ body, ports: data.ports });
    body = add_envs({
      body,
      envs: data.envs,
      hash: data.hash,
      username: data.username,
      password: data.password,
      label: data.label,
      target: data.target,
      generated_label: data.generated_label,
    });
    body = add_storage({
      body,
      username: data.username,
      label: data.label,
      hash: data.hash,
      has_storage: data.has_storage,
    });

    const url = `/apis/apps/v1/namespaces/n${data.hash}/deployments`;
    return await fetch({ url, method: 'POST', body }).then((res) => ({
      result: res,
      type: 'Deployment',
      name: `${data.label}${data.hash}`,
    }));
  } catch (err) {
    logger.debug(err);
  }
};
/**
 * Private function that will add the node_selectors part to the body.
 * @param {Array} node_selectors node selectors to attributes to the body.
 * @param {JSON} body body to update, used to create the final deployment.
 * @returns {JSON}
 */
const add_node_selectors = function (props) {
  const schema = z.object({
    node_selectors: z.array(z.lazy(() => NodeSelector.schema)).default([]),
    body: z.json(),
  });
  const data = Guard.validateProps(schema, props);

  if (data.body?.spec?.template?.spec === undefined)
    throw new ParameterMisformed('The props.body parameter is misformed.');
  data.body.spec.template.spec = {
    ...data.body.spec.template.spec,
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
  for (let ns of data.node_selectors) {
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
      data.body.spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms.push(
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
        data.body.spec.template.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms[
          ns
        ].matchExpressions[0].values.push(`${v}`);
      }
    }
  }
  return data.body;
};

/**
 * Private function that will add the service commands part to the body.
 * @param {String} service_command service command to set in the body.
 * @param {JSON} body body to update, used to create the final deployment.
 * @returns {JSON}
 */
const add_service_commands = function (props) {
  const schema = z.object({
    service_command: z.string().default(''),
    body: z.json(),
  });
  const data = Guard.validateProps(schema, props);
  if (data?.body?.spec?.template?.spec?.containers === undefined)
    throw new ParameterMisformed('The data.body parameter is misformed.');
  if (data.service_command === '') return data.body;
  data.body.spec.template.spec.containers[0].command = [];
  for (let sc of data.service_command.split(' ')) {
    data.body.spec.template.spec.containers[0].command.push(`${sc}`);
  }
  return data.body;
};

/**
 * Private function that will add arguments to the body object.
 * @param {Array<String>} args list of args to set in the body.
 * @param {String} hash unique has the application.
 * @param {String} generated_label generated label for the application.
 * @param {String} username username in the final container.
 * @param {String} password password in the final container.
 * @param {String} label label of the container.
 * @param {JSON} body body to update, used to create the final deployment.
 * @param {String} target target one container to speak to another (alpha).
 * @returns {JSON}
 */
const add_arguments = function (props) {
  const schema = z.object({
    args: z.array(z.lazy(() => Argument.schema)).default([]),
    hash: z.string().min(6).max(6).default(''),
    generated_label: z.string().default(''),
    username: z.string().default(''),
    password: z.string().default(''),
    label: z.string().default(''),
    body: z.json(),
    target: z.string().default(''),
  });
  const data = Guard.validateProps(schema, props);
  if (data.args.length === 0) return props.body;
  if (data?.body?.spec?.template?.spec?.containers === undefined)
    throw new ParameterMisformed('The data.body parameter is misformed.');

  data.body.spec.template.spec.containers[0].args = [];
  data.args.forEach((arg) => {
    data.body.spec.template.spec.containers[0].args.push(
      parsing_generic_tags(arg.value, {
        ...data,
        web_title: `SSH - ${data.generated_label}`,
      })
    );
  });

  return data.body;
};

/**
 * Private function that will add ports part to the body object.
 * @param {Array} ports list of ports to set in the body.
 * @param {JSON} body body to update, used to create the final deployment.
 * @returns {JSON}
 */
const add_ports = function (props) {
  const schema = z.object({
    ports: z.array(z.lazy(() => Port.schema)).default([]),
    body: z.json(),
  });
  const data = Guard.validateProps(schema, props);
  if (data?.body?.spec?.template?.spec?.containers === undefined)
    throw new ParameterMisformed('The data.body parameter is misformed.');
  if (data.ports.length === 0) return data.body;
  for (const element of data.ports) {
    if (!z.coerce.number().safeParse(element.port).success) {
      throw new ParameterMisformed('One of the port is not a Number.');
    }
  }
  data.body.spec.template.spec.containers[0].ports = [];
  for (const element of data.ports) {
    data.body.spec.template.spec.containers[0].ports.push({
      containerPort: element.port,
      protocol: 'TCP',
    });
  }
  return data.body;
};

/**
 * Private function that will add envs part to the body object.
 * @param {Array} envs list of envs to set in the body.
 * @param {JSON} body body to update, used to create the final deployment.
 * @param {String} generated_label generated label for the application.
 * @param {String} username username in the final container.
 * @param {String} password password in the final container.
 * @param {String} label label of the container.
 * @param {String} hash unique has the application.
 * @returns {JSON}
 */
const add_envs = function (props) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
    body: z.json(),
    envs: z.array(z.lazy(() => VariableEnvironment.schema)).default([]),
    username: z.string().default(''),
    password: z.string().default(''),
    label: z.string().default(''),
    generated_label: z.string().default(''),
  });
  const data = Guard.validateProps(schema, props);

  if (data.envs.length === 0) return data.body;
  if (data?.body?.spec?.template?.spec?.containers === undefined)
    throw new ParameterMisformed('The data.body parameter is misformed.');

  data.body.spec.template.spec.containers[0].env = [];
  data.body.spec.template.spec.containers[0].env.push(
    ...data.envs.map((env) => ({
      name: env.key,
      value: parsing_generic_tags(env.value, {
        ...data,
        web_title: `SSH - ${data.generated_label}`,
      }),
    }))
  );

  return data.body;
};

/**
 * Private functions that add GPU compute process in the deployment.
 * @param {JSON} body body to update, used to create the final deployment.
 * @returns {JSON}
 */
const add_compute_gpu = function (props) {
  const schema = z.object({
    body: z.json(),
  });
  const data = Guard.validateProps(schema, props);
  data.body.spec.template.spec.runtimeClassName = 'nvidia';
  data.body.spec.template.spec.containers[0].resources.limits[
    'nvidia.com/gpu'
  ] = 1;
  return data.body;
};

/**
 * Private function that will add storage part to the body object.
 * @param {JSON} body body to update, used to create the final deployment.
 * @param {String} username username in the final container.
 * @param {String} label label of the container.
 * @param {String} hash unique has the application.
 * @param {Boolean} has_storage do we have to attach a volume to the application.
 * @returns {JSON}
 */
const add_storage = function (props) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
    body: z.json(),
    username: z.string().default(''),
    label: z.string().default(''),
    has_storage: z.boolean().default(false),
  });
  const data = Guard.validateProps(schema, props);
  if (data?.body?.spec?.template?.spec?.containers === undefined)
    throw new ParameterMisformed('The data.body parameter is misformed.');
  if (!data.has_storage) return data.body;

  if (CONFIG.KUBERNETES_VOLUME_TYPE === 'Block') {
    data.body.spec.template.spec.containers[0].volumeDevices = [];
    data.body.spec.template.spec.containers[0].volumeDevices.push({
      devicePath: `/home/${data.username}`,
      name: `${data.label}${data.hash}-pvc`,
    });
  } else {
    data.body.spec.template.spec.containers[0].volumeMounts = [];
    data.body.spec.template.spec.containers[0].volumeMounts.push({
      mountPath: `/home/${data.username}`,
      name: `${data.label}${data.hash}-pvc`,
    });
  }
  data.body.spec.template.spec.volumes = [];
  data.body.spec.template.spec.volumes.push({
    name: `${data.label}${data.hash}-pvc`,
    persistentVolumeClaim: {
      claimName: `${data.label}${data.hash}-pvc`,
    },
  });
  return data.body;
};

/**
 * Private function that will fetch the Kubernetes API to get the deployment object.
 * @param {String} hash unique has the application.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
const get = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  const url = `/apis/apps/v1/namespaces/n${data.hash}/deployments?labelSelector=type=Deployment,hash=${data.hash}`;
  return await fetch({ url, method: 'GET' }).then((res) => {
    if (res === 'Kubernetes is not activated.') return { result: res };
    return {
      result: res.items.map((item) => item.metadata.name),
      type: 'Deployments',
    };
  });
};

/**
 * Private function that will execute the deletion of the deployment in the Kubernetes cluster.
 * @param {String} hash unique has the application.
 * @param {String} name name of the application to delete.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
const del = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
    name: z.string(),
  });
  const data = Guard.validateProps(schema, props);
  const url = `/apis/apps/v1/namespaces/n${data.hash}/deployments/${data.name}`;
  return await Promise.resolve(fetch({ url, method: 'DELETE' })).then(
    (res) => ({
      result: res,
      type: 'Deployment',
      name: `${data.name}`,
    })
  );
};

/**
 * Private function that will execute the update of the scale on the Kubernetes API.
 * @param {String} hash unique has the application.
 * @param {String} name name of the application to delete.
 * @param {Number} replicas count of replicas of the application we want.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
const put = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
    name: z.string(),
    replicas: z.number().default(1),
  });
  const data = Guard.validateProps(schema, props);
  const body = {
    kind: 'Scale',
    apiVersion: 'autoscaling/v1',
    metadata: {
      name: `${data.name}`,
      namespace: `n${data.hash}`,
    },
    spec: {
      replicas: data.replicas,
    },
  };
  const url = `/apis/apps/v1/namespaces/n${data.hash}/deployments/${data.name}/scale`;
  return await fetch({ url, body, method: 'PUT' }).then((res) => ({
    result: res,
    type: 'Deployment',
    name: `${data.name}`,
  }));
};

/**
 * Function that will fetch kapi to get all the Pods in a specific namespace.
 * @param {String} hash unique hash to identify the application on the cluster.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const get_pods = async (
  props,
  fns = {
    fetch: kapi.fetch,
  }
) => {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  return await fns
    .fetch({
      method: 'GET',
      url: `/api/v1/namespaces/n${data.hash}/pods`,
    })
    .then((r) => {
      if (r === 'Kubernetes is not activated.') return r;
      for (let item of r.items) {
        item.kind = 'Pod';
      }
      return r;
    });
};

/**
 * Function that will fetch kapi to get all the Deployments in a specific namespace.
 * @param {String} hash unique hash to identify the application on the cluster.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const get_deployments = async (
  props,
  fns = {
    fetch: kapi.fetch,
  }
) => {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  return await fns
    .fetch({
      method: 'GET',
      url: `/apis/apps/v1/namespaces/n${data.hash}/deployments`,
    })
    .then((r) => {
      if (r === 'Kubernetes is not activated.') return r;
      for (let item of r.items) {
        item.kind = 'Deployment';
      }
      return r;
    });
};

/**
 * Function that will get the replicasets from the kubernetes API.
 * @param {String} hash unique hash to identify the application on the cluster.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const get_replicasets = async (
  props,
  fns = {
    fetch: kapi.fetch,
  }
) => {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  return await fns
    .fetch({
      method: 'GET',
      url: `/apis/apps/v1/namespaces/n${data.hash}/replicasets`,
    })
    .then((r) => {
      if (r === 'Kubernetes is not activated.') return r;
      for (let item of r.items) {
        item.kind = 'ReplicaSet';
      }
      return r;
    });
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
