import * as parametres from '../utils/parametres.service.js';
import * as deployment from '../objects/deployment.js';
import * as external_name from '../objects/external_name.js';
import * as ingress from '../objects/ingress.js';
import * as namespace from '../objects/namespace.js';
import * as pvc from '../objects/pvc.js';
import * as registry_hub from '../objects/registry.js';
import * as service from '../objects/service.js';
import * as authorization_policy from '../objects/authorization-policy.js';
import * as network_policy from '../objects/network-policy.js';
import * as mongodb from '../modules/mongo.module.js';
import {
  BadTypeArgumentError,
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.service.js';

/**
 * Function that will execute the deletion workflow.
 * @param {*} props {hash}
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const exec_deletion = async function (
  props = { hash: undefined },
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
  const expected_props = {
    hash: undefined,
  };
  try {
    if (parametres.check_props(expected_props, props).length > 0)
      throw new MissingArgumentError(
        `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
      );
    if (!parametres.check_hash(props.hash))
      throw new ParameterMisformed('The props.hash parameter is misformed.');

    const promises = [];
    promises.push(fns.delete_network_policy({ hash: props.hash }));
    promises.push(fns.delete_authorization_policy({ hash: props.hash }));
    promises.push(fns.external_name_deletion({ hash: props.hash }));
    promises.push(fns.namespace_deletion({ hash: props.hash }));
    promises.push(
      fns.delete_application({
        hash: props.hash,
      })
    );
    promises.push(fns.registry_hub_deletion({ hash: props.hash }));
    promises.push(fns.deployment_deletion({ hash: props.hash }));
    promises.push(fns.service_deletion({ hash: props.hash }));
    promises.push(fns.deleteFromKong({ hash: props.hash }));

    return await Promise.all(promises).then((r) => {
      return {
        hash: props.hash,
      };
    });
  } catch (err) {
    throw err;
  }
};

/**
 * Function that will execute the starting workflow.
 * @param {*} props {hash}
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const exec_start = async function (
  props = { hash: undefined },
  fns = {
    scale: deployment.scale,
    update_application: mongodb.updateApplication,
  }
) {
  const expected_props = {
    hash: undefined,
  };
  try {
    if (parametres.check_props(expected_props, props).length > 0)
      throw new MissingArgumentError(
        `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
      );
    if (!parametres.check_hash(props.hash))
      throw new ParameterMisformed('The props.hash parameter is misformed.');

    const promises = [
      fns.scale({ hash: props.hash, replicas: 1 }),
      fns.update_application({
        hash: props.hash,
        state: 'started',
      }),
    ];
    return await Promise.all(promises).then((r) => {
      return {
        hash: props.hash,
      };
    });
  } catch (err) {
    throw err;
  }
};

/**
 * Function that will execute the extinction workflow.
 * @param {*} props {hash}
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const exec_shutdown = async function (
  props = { hash: undefined },
  fns = {
    update_application: mongodb.updateApplication,
    scale: deployment.scale,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
  };
  try {
    if (parametres.check_props(expected_props, props).length > 0)
      throw new MissingArgumentError(
        `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
      );
    if (!parametres.check_hash(props.hash))
      throw new ParameterMisformed('The props.hash parameter is misformed.');

    const promises = [
      fns.scale({ hash: props.hash, replicas: 0 }),
      fns.update_application({
        hash: props.hash,
        state: 'shutted',
      }),
    ];
    return await Promise.all(promises).then((r) => {
      return {
        hash: props.hash,
      };
    });
  } catch (err) {
    throw err;
  }
};

/**
 * Service that execute the whole application creation workflow.
 * @param {*} props {hash}
 * @param {*} fns overwriting functions for tests.
 * @returns
 */
export const create = async function (
  props = {
    hash: undefined,
    interfaces: [],
    generated_label: undefined,
    username: undefined,
    password: undefined,
    web_title: undefined,
  },
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
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
    interfaces: [],
    generated_label: undefined,
    username: undefined,
    password: undefined,
    web_title: undefined,
  };
  try {
    if (parametres.check_props(expected_props, props).length > 0)
      throw new MissingArgumentError(
        `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
      );
    if (!parametres.check_hash(props.hash))
      throw new ParameterMisformed('The props.hash parameter is misformed.');
    if (!parametres.check_libelle(props.generated_label))
      throw new ParameterMisformed(
        'The props.generated_label parameter is misformed.'
      );
    if (!parametres.check_libelle(props.username))
      throw new ParameterMisformed(
        'The props.username parameter is misformed.'
      );
    if (
      !Array.isArray(props.interfaces) ||
      !props.interfaces.every((item) => parametres.check_JSON(item))
    )
      throw new BadTypeArgumentError(
        'The props.interfaces parameter is misformed.'
      );
    await fns.save_app({
      application: {
        hash: props.hash,
        interfaces: props.interfaces,
        generated_label: props.generated_label,
        web_title: props.web_title,
        username: props.username,
        password: props.password,
        state: 'created',
      },
    });
    await fns.create_namespace({ hash: props.hash });
    await fns.create_registry_hub({ hash: props.hash });
    await fns.create_authorization_policy({ hash: props.hash });
    await fns.create_network_policy({ hash: props.hash });
    // On détecte les stockages à activer.
    const promises = [];
    const storage = props.interfaces.flatMap((app) =>
      app.envs
        .filter((env) => env.key === 'HSTORAGE')
        .map(() => app.label.toLowerCase().replace(' ', ''))
    );
    for (let app of props.interfaces) {
      const label = app.label.toLocaleLowerCase().replace(' ', '');
      // On génère le clusterip ssh
      promises.push(
        fns.create_service({
          label,
          hash: props.hash,
          port_externe: 22,
          port_interne: 22,
          type: service.SVC_TYPE.CLUSTERIP,
        })
      );
      // On génère les services et ingress controller.
      promises.push(
        fns.addInKong({
          hash: props.hash,
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
            hash: props.hash,
            label,
          })
        );
        promises.push(
          fns.create_externalname({
            hash: props.hash,
            label,
            port_externe: port.port,
          })
        );
      }
      // On ajoute le stockage
      if (storage.includes(label)) {
        promises.push(
          fns.create_pvc({
            hash: props.hash,
            label,
          })
        );
      }
      // On génère les depploy
      if (!label.includes('ssh-')) {
        promises.push(
          fns.create_deployment({
            hash: props.hash,
            image: app.image,
            image_tag: app.image_tag,
            username: props.username,
            password: props.password,
            service_command: app.service_command,
            label,
            web_title: props.web_title,
            ports: app.ports,
            envs: app.envs,
            args: app.args,
            privileged: app.privileged,
            generated_label: props.generated_label,
            has_storage: storage.includes(label),
            readiness_probe_initial_delay: app.readiness_probe_initial_delay,
            readiness_probe_period: app.readiness_probe_period,
            liveness_probe_initial_delay: app.liveness_probe_initial_delay,
            liveness_probe_period: app.liveness_probe_period,
            need_compute_gpu: app.need_compute_gpu,
            need_graphical_rendering_gpu: app.need_graphical_rendering_gpu,
            ram_limit: app.ram_limit,
            ram_request: app.ram_request,
            cpu_request: app.cpu_request,
            cpu_limit: app.cpu_limit,
            node_selectors: app.node_selectors,
            target: '',
          })
        );
      } else {
        promises.push(
          fns.create_deployment({
            hash: props.hash,
            image: app.image,
            image_tag: app.image_tag,
            username: props.username,
            password: props.password,
            service_command: app.service_command,
            label,
            web_title: props.web_title,
            ports: app.ports,
            envs: app.envs,
            args: app.args,
            privileged: app.privileged,
            generated_label: props.generated_label,
            has_storage: storage.includes(label),
            readiness_probe_initial_delay: app.readiness_probe_initial_delay,
            readiness_probe_period: app.readiness_probe_period,
            liveness_probe_initial_delay: app.liveness_probe_initial_delay,
            liveness_probe_period: app.liveness_probe_period,
            need_compute_gpu: app.need_compute_gpu,
            need_graphical_rendering_gpu: app.need_graphical_rendering_gpu,
            ram_limit: app.ram_limit,
            ram_request: app.ram_request,
            cpu_request: app.cpu_request,
            cpu_limit: app.cpu_limit,
            node_selectors: app.node_selectors,
            target: label.split('ssh-')[1],
          })
        );
      }
    }
    return await Promise.all(promises).then((r) => {
      return {
        hash: props.hash,
      };
    });
  } catch (err) {
    throw err;
  }
};
