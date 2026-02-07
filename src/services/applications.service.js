import * as application_builder from '../builders/applications.builder.js';
import * as environment_builder from '../builders/environment.builder.js';
import * as user_builder from '../builders/user.builder.js';
import * as datacenter_builder from '../builders/datacenter.builder.js';
import * as history_builder from '../builders/history.builder.js';
import {
  exec_shutdown,
  exec_start,
  exec_deletion,
} from './deployment.service.js';
import * as storage_service from './application/storage.service.js';
import moment from 'moment-timezone';
import * as password from '../utils/password.service.js';
import CONFIG from '../config/config.js';
import * as parametres from '../utils/parametres.service.js';
import {
  MissingArgumentError,
  ParameterMisformed,
  ApplicationInvalidStateError,
} from '../utils/errors.service.js';
import { History } from '../objects/History.js';

/**
 * Service that will get all the informations about an application.
 * @param {*} props {id_application}
 * @param {*} fns overwriting function for tests
 * @returns Application {}
 */
export const get = async (
  props = {
    id_application: undefined,
    key: undefined,
  },
  fns = {
    application_get: application_builder.get,
    environment_get: environment_builder.get,
    datacenter_get: datacenter_builder.get,
    history_get_last_record: history_builder.get_last_record,
  }
) => {
  if (props.id_application === undefined && props.key === undefined)
    throw new MissingArgumentError(
      `One or multiple arguments (id_application,key) are missing.`
    );
  if (
    props.id_application !== undefined &&
    !parametres.check_id(props.id_application)
  )
    throw new ParameterMisformed(
      'The props.id_application parameter is misformed.'
    );

  if (props.key !== undefined && !parametres.check_key(props.key))
    throw new ParameterMisformed('The props.key parameter is misformed.');

  const options = {};
  if (props.key) options.key = props.key;
  if (props.id_application) options.id_application = props.id_application;

  const application = await Promise.resolve(fns.application_get(options));
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
 * @param {*} props {id_user}
 * @param {*} fns osverwriting functions for test.
 * @returns [Application {}, ... ]
 */
export const list = async function (
  props = {
    id_user: undefined,
  },
  fns = {
    application_list: application_builder.list,
    environment_get: environment_builder.get,
    datacenter_list: datacenter_builder.list,
    history_get_last_record: history_builder.get_last_record,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_user: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_user))
    throw new ParameterMisformed('The props.id_user parameter is misformed.');

  const applications = await Promise.resolve(
    fns.application_list({ id_user: props.id_user })
  );
  const datacenters = await Promise.resolve(fns.datacenter_list());
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
        id_user: props.id_user,
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
 * @param {*} props {id_application, state_application}
 * @param {*} fns overwriting functions for tests
 * @returns Application {}
 */
export const update_state = async function (
  props = {
    id_application: undefined,
    state_application: undefined,
  },
  fns = {
    application_get: application_builder.get,
    datacenter_get: datacenter_builder.get,
    application_update: application_builder.update_state,
    exec_start: exec_start,
    exec_shutdown: exec_shutdown,
    environment_get: environment_builder.get,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_application: undefined,
    state_application: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_application))
    throw new ParameterMisformed(
      'The props.id_application parameter is misformed.'
    );
  if (props.state_application !== 'Off' && props.state_application !== 'Ready')
    throw new ParameterMisformed(
      "The props.state_application must be in ['Off','Ready']."
    );
  // We get the app
  const application = await Promise.resolve(
    fns.application_get({ id_application: props.id_application })
  );

  // We get the corresponding datacenter
  const datacenter = await Promise.resolve(
    fns.datacenter_get({ id_datacenter: application.datacenter.id_datacenter })
  );

  // we update the app in the db
  await Promise.resolve(
    fns.application_update({
      id_application: props.id_application,
      state_application: props.state_application,
    })
  );
  const promises = [];
  // We get the updated database
  promises.push(fns.application_get({ id_application: props.id_application }));
  if (props.state_application === 'Ready') {
    promises.push(
      fns.environment_get({ id_environment: application.id_environment })
    );
    promises.push(fns.exec_start({ hash: application.hash, datacenter }));
  } else
    promises.push(fns.exec_shutdown({ hash: application.hash, datacenter }));
  return await Promise.all(promises).then((r) => {
    r[0].datacenter = datacenter;
    if (props.state_application === 'Ready') r[0].environment = r[1];
    return r[0];
  });
};

/**
 * Service that launchs the deletion of the application.
 * @param {*} props {id_application}
 * @param {*} fns overwriting functions for tests
 * @returns Application {}
 */
export const deletion = async function (
  props = {
    id_application: undefined,
    backup_storage: true,
  },
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
  // We check all mandatory props before doing anything
  const expected_props = {
    id_application: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_application))
    throw new ParameterMisformed(
      'The props.id_application parameter is misformed.'
    );
  if (!parametres.check_boolean(props.backup_storage))
    throw new ParameterMisformed(
      'The props.backup_storage parameter is misformed.'
    );
  const app = await Promise.resolve(
    fns.application_get({ id_application: props.id_application })
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

  if (props.backup_storage) {
    promises.push(
      fns.download_deletion({ id_application: props.id_application })
    );
    promises.push(
      fns.exec_shutdown({ hash: app.hash, datacenter }).then(() => {
        console.log('Application shutdown completed');
        return fns.export_storage({
          id_application: props.id_application,
          delete_existing_export: true,
          app_deletion: true,
        });
      })
    );
  } else {
    console.log('oe');
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
 * @param {*} props {id_user,id_environment,label}
 * @param {*} fns overwriting functions for tests
 * @returns Application {}
 */
export const create = async function (
  props = {
    id_user: undefined,
    id_environment: undefined,
    id_datacenter: undefined,
    label: undefined,
    state_changed_date: undefined,
  },
  fns = {
    user_get: user_builder.get,
    password_generate: password.generate_label,
    generate_unique_label: password.generate_unique_label,
    unique_hash_generate: password.generate_unique_hash,
    environment_get: environment_builder.get,
    application_create: application_builder.create,
    datacenter_get: datacenter_builder.get,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_user: undefined,
    id_environment: undefined,
    id_datacenter: undefined,
    label: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_user))
    throw new ParameterMisformed('The props.id_user parameter is misformed.');
  if (!parametres.check_id(props.id_environment))
    throw new ParameterMisformed(
      'The props.id_environment parameter is misformed.'
    );
  if (!parametres.check_id(props.id_datacenter))
    throw new ParameterMisformed(
      'The props.id_datacenter parameter is misformed.'
    );

  const infos = await fns.user_get({ id_user: props.id_user });
  const pwd = await fns.password_generate({ count: 3 });
  const randomName = await fns.generate_unique_label({ count: 3 });
  const hash = await fns.unique_hash_generate();
  const environment = await fns.environment_get({
    id_environment: props.id_environment,
  });
  const datacenter = await fns.datacenter_get({
    id_datacenter: props.id_datacenter,
  });
  const launch_date =
    props.state_changed_date === undefined
      ? moment.tz(CONFIG.APP_TZ)
      : moment(props.state_changed_date).tz(CONFIG.APP_TZ);
  const promises = [
    fns.application_create({
      id_user: props.id_user,
      id_environment: props.id_environment,
      id_datacenter: props.id_datacenter,
      custom_label: props.label,
      generated_label: randomName,
      hash: hash,
      username:
        infos.firstname[0].toLowerCase() +
        '_' +
        infos.lastname
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, ''),
      password: pwd,
      state_changed_date: launch_date,
    }),
  ];

  return await Promise.all(promises).then((r) => {
    r[0].environment = environment;
    r[0].datacenter = datacenter;
    return r[0];
  });
};
