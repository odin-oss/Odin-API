import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../utils/errors.service.js';
import * as parametres from '../../src/utils/parametres.service.js';
import { fetch } from '../../modules/appsingress.module.js';
import CONFIG from '../../config/config.js';

/**
 * Function that will add Routes and Services to Kong corresponding to one application.
 * @param {*} param0
 * @returns
 */
export const addInKong = async function (
  props = {
    hash: undefined,
    ports: undefined,
    label: undefined,
  },
  fns = {
    fetch: fetch,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
    ports: undefined,
    label: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_libelle(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!parametres.check_libelle(props.label, 3))
    throw new ParameterMisformed('The props.label parameter is misformed.');

  for (let port of props.ports) {
    if (!parametres.check_port(port.port))
      throw new ParameterMisformed('The props.ports parameter is misformed.');
  }
  try {
    // Creating Service in Kong
    let promises = [];
    for (let port of props.ports) {
      const url = `http://${CONFIG.apps_ingress_url}/services`;
      const data = {
        name: `${props.hash}-${props.label}-${port.label.toLocaleLowerCase()}`,
        url: `http://ci${props.label}${props.hash}${port.port}-proxy:${port.port}`,
      };
      promises.push(
        fns.fetch({
          method: 'POST',
          url: url,
          body: data,
        })
      );
    }
    const svc = await Promise.all(promises);

    // Creating Route in Kong
    promises = [];
    for (let s = 0; s < svc.length; s++) {
      const url = `http://${CONFIG.apps_ingress_url}/services/${svc[s].id}/routes`;
      const data = {
        paths: [
          `/${props.hash}/${props.label}-${props.ports[s].label.toLocaleLowerCase()}/`,
          `/${props.hash}/${props.label}-${props.ports[s].label.toLocaleLowerCase()}`,
        ],
        strip_path:
          props.ports[s].port_type.toLocaleLowerCase() === 'strip_path'
            ? true
            : false,
        preserve_host: true,
      };

      // enable Odin-Auth plugin for authentication
      promises.push(
        fns.fetch({
          method: 'POST',
          url: `http://${CONFIG.apps_ingress_url}/services/${svc[s].id}/plugins`,
          body: {
            name: 'odin-auth',
            config: {
              auth_url: `https://${CONFIG.tls_api_crrs}/auth`,
            },
          },
        })
      );
      promises.push(
        fns.fetch({
          method: 'POST',
          url: url,
          body: data,
        })
      );
    }

    return await Promise.all(promises).then((r) => {
      return {
        result: r,
      };
    });
  } catch (err) {
    throw err;
  }
};

/**
 * Function that will delete Routes and Services from Kong corresponding to one application.
 * @param {*} param0
 * @returns
 */
export const deleteFromKong = async function (
  props = {
    hash: undefined,
  },
  fns = {
    fetch: fetch,
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

  try {
    // Creating Services and Routes from Kong
    let promises = [];
    promises.push(
      fns.fetch({
        method: 'GET',
        url: `http://${CONFIG.apps_ingress_url}/services`,
      })
    );
    promises.push(
      fns.fetch({
        method: 'GET',
        url: `http://${CONFIG.apps_ingress_url}/routes`,
      })
    );
    const [services, routes] = await Promise.all(promises);

    const filteredRoutes = routes.data.filter(
      (route) => route.paths && route.paths.some((p) => p.includes(props.hash))
    );
    const filteredServices = services.data.filter((svc) =>
      svc.host.includes(props.hash)
    );

    // Deleting Routes from Kong

    await Promise.all(
      filteredRoutes.map((route) =>
        fns.fetch({
          method: 'DELETE',
          url: `http://${CONFIG.apps_ingress_url}/routes/${route.id}`,
        })
      )
    );

    // Deleting Services from Kong
    return await Promise.all(
      filteredServices.map((svc) =>
        fns.fetch({
          method: 'DELETE',
          url: `http://${CONFIG.apps_ingress_url}/services/${svc.id}`,
        })
      )
    ).then((r) => {
      return {
        result: r,
      };
    });
  } catch (err) {
    throw err;
  }
};
