import * as deployment from '../objects/kubernetes/deployment.js';
import * as external_name from '../objects/kubernetes/external_name.js';
import * as ingress from '../objects/kubernetes/ingress.js';
import * as namespace from '../objects/kubernetes/namespace.js';
import * as pvc from '../objects/kubernetes/pvc.js';
import * as registry_hub from '../objects/kubernetes/registry.js';
import * as service from '../objects/kubernetes/service.js';
import * as authorization_policy from '../objects/kubernetes/authorization-policy.js';
import * as network_policy from '../objects/kubernetes/network-policy.js';
import * as mongodb from '../modules/mongodb.module.js';
import Guard from '../utils/guard.util.js';
import { Application } from '../objects/Application.js';
import z from 'zod';
import { Interface } from '../objects/Interface.js';

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
    update_application: mongodb.updateApplication,
    registry_hub_deletion: registry_hub.deletion,
    deployment_deletion: deployment.deletion,
    service_deletion: service.deletion,
    delete_application: mongodb.deleteApplication,
    deleteFromKong: ingress.deleteFromKong,
    delete_network_policy: network_policy.deletion,
    delete_authorization_policy: authorization_policy.deletion,
  }
) {
  const schema = z.object({
    hash: z.string().min(8).max(8),
  });
  const data = Guard.validateProps(schema, props);
  const promises = [
    fns.delete_network_policy({ ...data }),
    fns.delete_authorization_policy({ ...data }),
    fns.external_name_deletion({ ...data }),
    fns.namespace_deletion({ ...data }),
    fns.delete_application({ ...data }),
    fns.registry_hub_deletion({ ...data }),
    fns.deployment_deletion({ ...data }),
    fns.service_deletion({ ...data }),
    fns.deleteFromKong({ ...data }),
  ];

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
    update_application: mongodb.updateApplication,
  }
) {
  const schema = z.object({
    hash: z.string().min(8).max(8),
  });
  const data = Guard.validateProps(schema, props);
  const promises = [
    fns.scale({ ...data, replicas: 1 }),
    fns.update_application({
      ...data,
      state: 'started',
    }),
  ];
  return await Promise.all(promises).then(() => ({ ...data }));
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
    update_application: mongodb.updateApplication,
    scale: deployment.scale,
  }
) {
  const schema = z.object({
    hash: z.string().min(8).max(8),
  });
  const data = Guard.validateProps(schema, props);
  const promises = [
    fns.scale({ hash: data.hash, replicas: 0 }),
    fns.update_application({
      hash: data.hash,
      state: 'shutted',
    }),
  ];
  return await Promise.all(promises).then(() => ({ ...data }));
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
    save_app: mongodb.saveApplication,
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
    hash: z.string().min(8).max(8),
    interfaces: z.array(z.instanceof(Interface)).default([]),
    generated_label: z.string(),
    username: z.string(),
    password: z.string(),
    web_title: z.string(),
  });
  const data = Guard.validateProps(schema, props);
  await fns.save_app({
    application: {
      ...data,
      state: 'created',
    },
  });
  await fns.create_namespace({ hash: data.hash });
  await fns.create_registry_hub({ hash: data.hash });
  await fns.create_authorization_policy({ hash: data.hash });
  await fns.create_network_policy({ hash: data.hash });
  // On détecte les stockages à activer.
  const promises = [];
  const storage = data.interfaces.flatMap((app) =>
    app.envs
      .filter((env) => env.key === 'HSTORAGE')
      .map(() => app.label.toLowerCase().replace(' ', ''))
  );
  for (let app of data.interfaces) {
    const label = app.label.toLocaleLowerCase().replace(' ', '');
    // On génère le clusterip ssh
    promises.push(
      fns.create_service({
        label,
        hash: data.hash,
        port_externe: 22,
        port_interne: 22,
        type: service.SVC_TYPE.CLUSTERIP,
      })
    );
    // On génère les services et ingress controller.
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
          ...app,
          hash: props.hash,
          username: props.username,
          password: props.password,
          label,
          web_title: props.web_title,
          generated_label: props.generated_label,
          has_storage: storage.includes(label),
          target: label.split('ssh-')[1],
        })
      );
    } else {
      promises.push(
        fns.create_deployment({
          ...app,
          hash: props.hash,
          username: props.username,
          password: props.password,
          label,
          web_title: props.web_title,
          generated_label: props.generated_label,
          has_storage: storage.includes(label),
          target: '',
        })
      );
    }
  }
  return await Promise.all(promises).then(() => ({ hash: data.hash }));
};
