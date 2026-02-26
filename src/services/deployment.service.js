import * as deployment from '../objects/kubernetes/deployment.js';
import * as external_name from '../objects/kubernetes/external_name.js';
import * as ingress from '../objects/kubernetes/ingress.js';
import * as namespace from '../objects/kubernetes/namespace.js';
import * as pvc from '../objects/kubernetes/pvc.js';
import * as registry_hub from '../objects/kubernetes/registry.js';
import * as service from '../objects/kubernetes/service.js';
import * as authorization_policy from '../objects/kubernetes/authorization-policy.js';
import * as network_policy from '../objects/kubernetes/network-policy.js';
import Guard from '../utils/guard.util.js';
import { Application } from '../objects/Application.js';
import z from 'zod';
import { Interface } from '../objects/Interface.js';
import { Environment } from '../objects/Environment.js';
import { Datacenter } from '../objects/Datacenter.js';
import CONFIG from '../config/config.js';
import logger from '../middlewares/winston.js';

/**
 * Function that will execute the deletion workflow.
 * @param {String} hash inique hash of the application to delete.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Application}
 */
export const exec_deletion = async function (
  props,
  fns = {
    external_name_deletion: external_name.deletion,
    namespace_deletion: namespace.deletion,
    registry_hub_deletion: registry_hub.deletion,
    deployment_deletion: deployment.deletion,
    service_deletion: service.deletion,
    deleteFromKong: ingress.deleteFromKong,
    delete_network_policy: network_policy.deletion,
    delete_authorization_policy: authorization_policy.deletion,
  }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  const promises = [
    //fns.delete_network_policy({ ...data }),
    fns.external_name_deletion({ ...data }),
    fns.namespace_deletion({ ...data }),
    fns.registry_hub_deletion({ ...data }),
    fns.deployment_deletion({ ...data }),
    fns.service_deletion({ ...data }),
    fns.deleteFromKong({ ...data }),
  ];
  if (CONFIG.KUBERNETES_ISTIO_ACTIVATED)
    promises.push(fns.delete_authorization_policy({ ...data }));
  return await Promise.all(promises).then((r) => ({ ...data }));
};

/**
 * Function that will execute the starting workflow.
 * @param {String} hash inique hash of the application to delete.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Application}
 */
export const exec_start = async function (
  props,
  fns = {
    scale: deployment.scale,
  }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.scale({ ...data, replicas: 1 }).then(() => ({ ...data }));
};

/**
 * Function that will execute the extinction workflow.
 * @param {String} hash inique hash of the application to delete.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Application}
 */
export const exec_shutdown = async function (
  props,
  fns = {
    scale: deployment.scale,
  }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  return await fns
    .scale({ hash: data.hash, replicas: 0 })
    .then(() => ({ ...data }));
};

/**
 * Service that execute the whole application creation workflow.
 * @param {String} hash inique hash of the application to delete.
 * @param {Array<Interface>} interfaces array of interfaces to create.
 * @param {String} generated_label automaticaly generated label.
 * @param {String} username username to admin access to this application.
 * @param {String} password password to admin access to this application.
 * @param {String} web_title web_title to display on UI.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {String}
 */
export const create = async function (
  props,
  fns = {
    create_namespace: namespace.create,
    create_registry_hub: registry_hub.create,
    create_service: service.create,
    create_externalname: external_name.create,
    create_pvc: pvc.create,
    create_deployment: deployment.create,
    create_network_policy: network_policy.create,
    create_authorization_policy: authorization_policy.create,
    addInKong: ingress.addInKong,
  }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
    datacenter: z.instanceof(Datacenter),
    environment: z.instanceof(Environment),
    generated_label: z.string(),
    username: z.string(),
    password: z.string(),
    id_user: z.coerce.number().int().positive(),
  });
  const data = Guard.validateProps(schema, props);
  await fns.create_namespace({ hash: data.hash });
  await fns.create_registry_hub({ hash: data.hash });
  if (CONFIG.KUBERNETES_ISTIO_ACTIVATED)
    await fns.create_authorization_policy({ hash: data.hash });
  //await fns.create_network_policy({ hash: data.hash }); to be deprecated because MONOLITH will not be automaticaly present on k8s cluster
  const promises = [];
  const storage = data.environment.interfaces.flatMap((app) =>
    app.envs
      .filter((env) => env.key === 'HSTORAGE')
      .map(() => app.label.toLowerCase().replace(' ', ''))
  );
  for (let app of data.environment.interfaces) {
    const label = app.label.toLocaleLowerCase().replace(' ', '');
    promises.push(
      fns.create_service({
        label,
        hash: data.hash,
        port_externe: 22,
        port_interne: 22,
        type: service.SVC_TYPE.CLUSTERIP,
      })
    );

    promises.push(
      fns.addInKong({
        hash: data.hash,
        ports: app.ports,
        label,
      })
    );

    for (let port of app.ports) {
      promises.push(
        fns.create_service({
          type: service.SVC_TYPE.CLUSTERIP,
          port_externe: port.port,
          port_interne: port.port,
          hash: data.hash,
          label,
        })
      );
      promises.push(
        fns.create_externalname({
          hash: data.hash,
          label,
          port_externe: port.port,
        })
      );
    }
    // On ajoute le stockage
    if (storage.includes(label)) {
      promises.push(
        fns.create_pvc({
          hash: data.hash,
          label,
        })
      );
    }
    if (label.includes('ssh-')) {
      promises.push(
        fns.create_deployment({
          ...app.toJSON(),
          hash: data.hash,
          username: data.username,
          password: data.password,
          label,
          generated_label: data.generated_label,
          has_storage: storage.includes(label),
          target: label.split('ssh-')[1],
        })
      );
    } else {
      promises.push(
        fns.create_deployment({
          ...app.toJSON(),
          hash: data.hash,
          username: data.username,
          password: data.password,
          label,
          generated_label: data.generated_label,
          has_storage: storage.includes(label),
          target: '',
        })
      );
    }
  }
  return await Promise.allSettled(promises).then(() => ({ hash: data.hash }));
};
