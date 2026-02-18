import * as application_builder from '../builders/applications.builder.js';
import * as environment_builder from '../builders/environment.builder.js';
import * as user_builder from '../builders/user.builder.js';
import * as datacenter_builder from '../builders/datacenter.builder.js';
import * as history_builder from '../builders/history.builder.js';
import { list as dictionary_list } from '../builders/randomdictionary.builder.js';
import {
  exec_shutdown,
  exec_start,
  exec_deletion,
} from './deployment.service.js';
import * as storage_service from '../services/storage.service.js';
import moment from 'moment-timezone';
import CONFIG from '../config/config.js';
import {
  MissingArgumentError,
  ApplicationInvalidStateError,
} from '../utils/errors.util.js';
import { History } from '../objects/History.js';
import Guard from '../utils/guard.util.js';
import {
  generate_label,
  generate_unique_hash,
  generate_unique_label,
} from './randomdictonary.service.js';
import z from 'zod';
import { Application } from '../objects/Application.js';

/**
 * Service that will get all the informations about an application.
 * @param {Number} id_application id of the application we are searching for.
 * @param {String} key key of the application we are searching for.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Application}
 */
export const get = async (
  props,
  fns = {
    application_get: application_builder.get,
    environment_get: environment_builder.get,
    datacenter_get: datacenter_builder.get,
    history_get_last_record: history_builder.get_last_record,
  }
) => {
  const schema = z.object({
    id_application: z.coerce.number().positive().optional(),
    key: z.string().optional(),
  });
  const data = Guard.validateProps(schema, props);
  if (props.id_application === undefined && props.key === undefined)
    throw new MissingArgumentError(
      `Either id_application or key must be sent.`
    );

  const application = await fns.application_get({ ...data });
  return await Promise.all([
    fns.environment_get({ id_environment: application.id_environment }),
    fns.datacenter_get({ id_datacenter: application.datacenter.id_datacenter }),
    fns.history_get_last_record({
      id_application: application.id_application,
      id_user: application.id_user,
    }),
  ]).then((r) => {
    application.environment = r[0];
    application.datacenter = r[1];
    application.history = r[2];
    return application;
  });
};

/**
 * Service that will list all the applications attached to an user.
 * @param {Number} id_user id of the user we want the list of application.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Array<Application>}
 */
export const list = async function (
  props,
  fns = {
    application_list: application_builder.list,
    environment_get: environment_builder.get,
    datacenter_list: datacenter_builder.list,
    history_get_last_record: history_builder.get_last_record,
  }
) {
  const schema = z.object({ id_user: z.number().positive() });
  const data = Guard.validateProps(schema, props);
  const applications = await fns.application_list({ id_user: data.id_user });
  const datacenters = await fns.datacenter_list();
  const environments_ids = Array.from(
    new Set(applications.map((obj) => obj.id_environment))
  );
  let promises = [];
  for (let id of environments_ids) {
    promises.push(fns.environment_get({ id_environment: id }));
  }
  promises = [
    ...promises,
    ...applications.map((app) =>
      fns.history_get_last_record({
        id_user: data.id_user,
        id_application: app.id_application,
      })
    ),
  ];

  return await Promise.all(promises).then((result) => {
    for (let application of applications) {
      application.environment = result.filter(
        (env) => env.id_environment === application.id_environment
      )[0];
      application.datacenter = datacenters.filter(
        (dc) => dc.id_datacenter === application.datacenter.id_datacenter
      )[0];
    }
    const histories = result.filter((r) => r instanceof History);
    for (let history of histories)
      if (history.records.length > 0)
        applications.filter(
          (app) => app.id_application === history.records[0].id_application
        )[0].history = history;

    return applications;
  });
};

/**
 * Start / Shutdown an application that is currently on/off.
 * @param {Number} id_application id of the application we need to update.
 * @param {String} state_application new state to attribute to this application.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Application}
 */
export const update_state = async function (
  props,
  fns = {
    application_get: application_builder.get,
    datacenter_get: datacenter_builder.get,
    application_update: application_builder.update_state,
    exec_start: exec_start,
    exec_shutdown: exec_shutdown,
    environment_get: environment_builder.get,
  }
) {
  const schema = z.object({
    id_application: z.coerce.number().positive(),
    state_application: z.enum(['Off', 'Ready']),
  });
  const data = Guard.validateProps(schema, props);
  const application = await fns.application_get({
    id_application: data.id_application,
  });

  // We get the corresponding datacenter
  const datacenter = await fns.datacenter_get({
    id_datacenter: application.datacenter.id_datacenter,
  });

  // we update the app in the db
  await fns.application_update({
    id_application: data.id_application,
    state_application: data.state_application,
  });

  const promises = [];
  // We get the updated database
  promises.push(fns.application_get({ id_application: data.id_application }));
  if (data.state_application === 'Ready') {
    promises.push(
      fns.environment_get({ id_environment: application.id_environment })
    );
    promises.push(fns.exec_start({ hash: application.hash, datacenter }));
  } else
    promises.push(fns.exec_shutdown({ hash: application.hash, datacenter }));
  return await Promise.all(promises).then((r) => {
    r[0].datacenter = datacenter;
    if (data.state_application === 'Ready') r[0].environment = r[1];
    return r[0];
  });
};

/**
 * Service that launchs the deletion of the application.
 * @param {Number} id_application id of the application we need to update.
 * @param {Boolean} backup_storage is there storage to backup (optionnal, default true)
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Application}
 */
export const deletion = async function (
  props,
  fns = {
    application_get: application_builder.get,
    application_delete: application_builder.deletion,
    datacenter_get: datacenter_builder.get,
    exec_deletion: exec_deletion,
    exec_shutdown: exec_shutdown,
    download_deletion: application_builder.download_deletion,
    export_storage: storage_service.exportStorage,
  }
) {
  const schema = z.object({
    id_application: z.coerce.number().positive(),
    backup_storage: z.boolean().default(true),
  });
  const data = Guard.validateProps(schema, props);
  const app = await Promise.resolve(
    fns.application_get({ id_application: data.id_application })
  );
  if (!['Ready', 'Off'].includes(app.state_application))
    throw new ApplicationInvalidStateError(
      'The application must be in states Ready or Off to be deleted, current state is ' +
        app.state_application
    );

  const datacenter = await Promise.resolve(
    fns.datacenter_get({ id_datacenter: app.datacenter.id_datacenter })
  );
  const promises = [];

  if (data.backup_storage) {
    promises.push(
      fns.download_deletion({ id_application: data.id_application })
    );
    promises.push(
      fns.exec_shutdown({ hash: app.hash, datacenter }).then(() => {
        return fns.export_storage({
          id_application: data.id_application,
          delete_existing_export: true,
          app_deletion: true,
        });
      })
    );
  } else {
    promises.push(
      fns.application_delete({ id_application: app.id_application })
    );
    promises.push(fns.exec_deletion({ hash: app.hash, datacenter }));
  }

  return await Promise.all(promises).then((r) => {
    app.datacenter = datacenter;
    return app;
  });
};

/**
 * Service that execute the creation workflow of an application.
 * @param {Number} id_user id of the user that will be owning this application.
 * @param {Number} id_environment id of the environment that serves as template for that application.
 * @param {Number} id_datacenter id of the datacenter that will be hosting this application.
 * @param {String} label custom label settled by user.
 * @param {String} state_changed_date date of the change of state. (optional)
 * @param {Function} fns overwriting functions for tests
 * @returns {Application}
 */
export const create = async function (
  props,
  fns = {
    user_get: user_builder.get,
    password_generate: generate_label,
    generate_unique_label,
    unique_hash_generate: generate_unique_hash,
    environment_get: environment_builder.get,
    application_create: application_builder.create,
    datacenter_get: datacenter_builder.get,
    dictionary_list,
  }
) {
  const schema = z.object({
    id_user: z.number().positive(),
    id_environment: z.coerce.number().positive(),
    id_datacenter: z.coerce.number().positive(),
    label: z.string().min(1).optional(),
    state_changed_date: z
      .refine((val) => moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) => moment(val).tz(CONFIG.APP_TZ))
      .default(moment.tz(CONFIG.APP_TZ)),
  });
  const data = Guard.validateProps(schema, props);
  const infos = await fns.user_get({ id_user: data.id_user });
  const dictionary = await fns.dictionary_list();
  const password = fns.password_generate({ count: 3, dictionary });

  const [generated_label, hash, environment, datacenter] = await Promise.all([
    fns.generate_unique_label({ count: 3, dictionary }),
    fns.unique_hash_generate(),
    fns.environment_get({
      id_environment: data.id_environment,
    }),
    fns.datacenter_get({
      id_datacenter: data.id_datacenter,
    }),
  ]);

  return await fns
    .application_create({
      ...data,
      generated_label,
      custom_label: data.label || generated_label,
      hash,
      username:
        infos.firstname[0].toLowerCase() +
        '_' +
        infos.lastname
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, ''),
      password,
    })
    .then((r) => {
      r.environment = environment;
      r.datacenter = datacenter;
      return r;
    });
};
