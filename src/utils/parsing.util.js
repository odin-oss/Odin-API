import z from 'zod';
import Guard from './guard.util.js';

/**
 * Function that will replace the tag keyname with the real value for customing environment.
 * @param {String} value value to search in.
 * @param {Object} custom_values custom values to put when a value is parsed.
 * @returns {String}
 */
export const parsing_generic_tags = function (
  value = '',
  custom_values = undefined
) {
  if (custom_values === undefined) return value;

  const schema = z.object({
    username: z.string().min(2),
    label: z.string().min(2),
    password: z.string().min(2),
    hash: z.string().min(2),
    generated_label: z.string().min(2),
    web_title: z.string().min(2),
    target: z.string().default(''),
  });
  const data = Guard.validateProps(schema, custom_values);
  let result = value.replace('<hash>', `${data.hash}`);
  result = result.replace('<username>', `${data.username}`);
  result = result.replace('<password>', `${data.password}`);
  result = result.replace('<generated_label>', `${data.generated_label}`);
  result = result.replace('<target>', `${data.target}`);
  result = result.replace(
    '<subpath>',
    `/${data.hash}/${data.label}${data.target ? '-terminal' : ''}`
  );
  result = result.replace('<vm_name>', `${data.web_title}`);
  return result;
};

/**
 * Function that will parse the items fetched before publishing them in Kafka.
 * @param {Array<>} items array of items object
 * @param {String} hash unique hash to identify the application on the cluster.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const parsingK8SObjects = function (
  props,
  fns = {
    get_state: attribute_state,
  }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
    items: z.array().default([]),
  });
  const data = Guard.validateProps(schema, props);
  const result = {
    sender: 'ms-state',
    hash: data.hash,
    state: 'Ready',
  };
  const tmp = [];

  for (const element of data.items) {
    tmp.push({
      state: fns.get_state(element),
    });
  }
  if (data.items.length === 0) result.state = 'Getting ready';
  else if (tmp.filter((i) => i.state === 'Error').length > 0)
    result.state = 'Error';
  else if (tmp.filter((i) => i.state === 'Deleted').length > 0)
    result.state = 'Deleted';
  else if (tmp.filter((i) => i.state === 'Off').length > 0)
    result.state = 'Off';
  else if (tmp.filter((i) => i.state === 'Getting ready').length > 0)
    result.state = 'Getting ready';
  return JSON.stringify(result);
};

/**
 * Function that will parse the state of the item following specifics critesis.
 * @param {JSON} item item object coming freshly from the cluster.
 * @returns {JSON}
 */
export const attribute_state = (item) => {
  const { kind, status, spec, metadata } = item;

  const phaseMapping = {
    Ready: ['Bound', 'Running'],
    Error: [
      'Lost',
      'Failed',
      'Waiting',
      'Succeeded',
      'CrashLoopBackOff',
      'Unknown',
    ],
    Deleted: ['Released'],
    'Getting ready': ['Pending', 'Available', 'ContainerCreating'],
    Off: ['Terminating'],
  };

  if (kind === 'Service') return 'Ready';

  if (['PersistentVolumeClaim', 'PersistentVolume', 'Pod'].includes(kind)) {
    return (
      Object.keys(phaseMapping).find((state) =>
        phaseMapping[state].includes(status.phase)
      ) || 'Getting ready'
    );
  }

  if (kind === 'ReplicaSet') {
    const desiredReplicas = parseInt(
      metadata.annotations['deployment.kubernetes.io/desired-replicas']
    );
    if (desiredReplicas === 0) return 'Off';
    return spec.replicas === status.readyReplicas ? 'Ready' : 'Getting ready';
  }

  if (kind === 'Deployment') {
    if (
      status.readyReplicas >= 1 &&
      status.availableReplicas >= 1 &&
      status.unavailableReplicas === undefined
    ) {
      return 'Ready';
    }
    if (status.unavailableReplicas >= 1 && status.readyReplicas === undefined) {
      return 'Getting ready';
    }
  }

  return 'Getting ready';
};
