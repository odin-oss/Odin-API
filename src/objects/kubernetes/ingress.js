import { fetch } from '../../modules/kong-api.module.js';
import CONFIG from '../../config/config.js';
import Guard from '../../utils/guard.util.js';
import z from 'zod';
import Port from '../Port.js';

/**
 * Function that will add Routes and Services to Kong corresponding to one application.
 * @param {String} hash unique hash to identify the proper service.
 * @param {String} ports list of all the ports to open on the ingress controller.
 * @param {String} label label of the port.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Array<JSON>}
 */
export const addInKong = async function (
  props,
  fns = {
    fetch,
  }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
    ports: z.array().default([]),
    label: z.string(),
  });
  const data_checks = Guard.validateProps(schema, props);
  // Creating Service in Kong
  let promises = [];
  for (let port of data_checks.ports) {
    const url = `/services`;
    const data = {
      name: `${data_checks.hash}-${data_checks.label}-${port.label.toLocaleLowerCase()}`,
      url: `http://ci${data_checks.label}${data_checks.hash}${port.port}-proxy:${port.port}`,
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
    const url = `/services/${svc[s].id}/routes`;
    const data = {
      paths: [
        `/${data_checks.hash}/${data_checks.label}-${data_checks.ports[s].label.toLocaleLowerCase()}/`,
        `/${data_checks.hash}/${data_checks.label}-${data_checks.ports[s].label.toLocaleLowerCase()}`,
      ],
      strip_path:
        data_checks.ports[s].port_type.toLocaleLowerCase() === 'strip_path',
      preserve_host: true,
    };

    // enable Odin-Auth plugin for authentication
    promises.push(
      fns.fetch({
        method: 'POST',
        url: `/services/${svc[s].id}/plugins`,
        body: {
          name: 'odin-auth',
          config: {
            auth_url: `https://${CONFIG.USER_APPS_HOSTNAME}/auth`,
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

  return await Promise.all(promises);
};

/**
 * Function that will delete Routes and Services from Kong corresponding to one application.
 * @param {String} hash unique hash to identify the proper service.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Array<JSON>}
 */
export const deleteFromKong = async function (
  props,
  fns = {
    fetch: fetch,
  }
) {
  const schema = z.object({
    hash: z.string().min(6).max(6),
  });
  const data = Guard.validateProps(schema, props);
  let promises = [];
  promises.push(
    fns.fetch({
      method: 'GET',
      url: `/services`,
    })
  );
  promises.push(
    fns.fetch({
      method: 'GET',
      url: `/routes`,
    })
  );
  const [services, routes] = await Promise.all(promises);

  const filteredRoutes = routes.data.filter(
    (route) => route.paths && route.paths.some((p) => p.includes(data.hash))
  );
  const filteredServices = services.data.filter((svc) =>
    svc.host.includes(data.hash)
  );
  await Promise.all(
    filteredRoutes.map((route) =>
      fns.fetch({
        method: 'DELETE',
        url: `/routes/${route.id}`,
      })
    )
  );

  // Deleting Services from Kong
  return await Promise.all(
    filteredServices.map((svc) =>
      fns.fetch({
        method: 'DELETE',
        url: `/services/${svc.id}`,
      })
    )
  );
};
