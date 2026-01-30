import { Op } from 'sequelize';
import CONFIG from '../config/config.js';
import db from '../config/db.config.js';
import moment from 'moment-timezone';
import * as parametres from '../utils/parametres.service.js';
import {
  DBObjectNotFound,
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.service.js';
import { Application } from '../objects/Application.js';
import { Environment } from '../objects/Environment.js';
import { Datacenter } from '../objects/Datacenter.js';

/**
 * Get the application from id.
 * @param integer id_application id of application.
 * @returns hash
 */
export const get = async function (
  props = {
    id_application: undefined,
    key: undefined,
    hash: undefined,
  }
) {
  if (
    props.id_application === undefined &&
    props.key === undefined &&
    props.hash === undefined
  )
    throw new MissingArgumentError(
      `One or multiple arguments (id_application,key,hash) are missing.`
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
  if (props.hash !== undefined && !parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  try {
    const options = {
      where: {},
      include: [
        {
          model: db.cirrus.ENUM_STATE_APPLICATION,
          required: true,
        },
        {
          model: db.cirrus.ENVIRONMENT,
          required: true,
        },
      ],
    };
    if (props.id_application !== undefined)
      options.where.id_application = props.id_application;
    if (props.key !== undefined) options.where.generated_label = props.key;
    if (props.hash !== undefined) options.where.hash = props.hash;
    return await Promise.resolve(db.cirrus.APPLICATION.findOne(options)).then(
      (r) => {
        if (r === null)
          throw new DBObjectNotFound(
            `The element id_application = '${props.id_application}' could not be found.`
          );
        return new Application({
          id_application: r.id_application,
          custom_label: r.custom_label,
          generated_label: r.generated_label,
          creation_date: moment(r.creation_date).tz(CONFIG.timezone),
          hash: r.hash,
          username: r.username,
          password: r.password,
          id_user: r.id_user,
          id_environment: r.id_environment,
          state_application: r.ENUM_STATE_APPLICATION.label,
          state_changed_date: moment(r.state_changed_date).tz(CONFIG.timezone),
          programming_shutdown_date:
            r.programming_shutdown_date == null
              ? null
              : moment(r.programming_shutdown_date).tz(CONFIG.timezone),
          datacenter: new Datacenter({ id_datacenter: r.id_datacenter }),
          environment: new Environment({
            id_environment: r.ENVIRONMENT.id_environment,
            label: r.ENVIRONMENT.label,
            icon: r.ENVIRONMENT.icon,
          }),
        });
      }
    );
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};

/**
 * Get the Application list from id_user.
 * @param integer id_user id of user.
 * @returns [Application {}, ...]
 */
export const list = async function (
  props = {
    id_user: undefined,
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
  try {
    const options = {
      where: { id_user: props.id_user },
      include: [
        {
          model: db.cirrus.ENUM_STATE_APPLICATION,
          required: true,
        },
        {
          model: db.cirrus.ENVIRONMENT,
          required: true,
        },
      ],
    };
    return await Promise.resolve(db.cirrus.APPLICATION.findAll(options)).then(
      (r) => {
        return r.map(
          (app) =>
            new Application({
              id_application: app.id_application,
              custom_label: app.custom_label,
              generated_label: app.generated_label,
              creation_date: moment(app.creation_date).tz(CONFIG.timezone),
              hash: app.hash,
              username: app.username,
              password: app.password,
              id_user: app.id_user,
              id_environment: app.id_environment,
              state_application: app.ENUM_STATE_APPLICATION.label,
              state_changed_date: moment(app.state_changed_date).tz(
                CONFIG.timezone
              ),
              programming_shutdown_date:
                app.programming_shutdown_date == null
                  ? null
                  : moment(app.programming_shutdown_date).tz(CONFIG.timezone),
              datacenter: new Datacenter({
                id_datacenter: app.id_datacenter,
                label: '',
                city: '',
                provider: '',
              }),
              environment: new Environment({
                id_environment: app.ENVIRONMENT.id_environment,
                label: app.ENVIRONMENT.label,
                icon: app.ENVIRONMENT.icon,
                interfaces: [],
              }),
            })
        );
      }
    );
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};

/**
 * Renew the application expiration date using the constant CONFIG.expiration
 * @param {*} props
 */
export const renew_expiration = async function (
  props = {
    id_application: undefined,
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
  try {
    const options = {
      where: {
        id_application: props.id_application,
      },
    };
    const application = await Promise.resolve(
      db.cirrus.APPLICATION.findOne(options)
    );
    if (application == null)
      throw new DBObjectNotFound('The application could not be found.');

    const opt_update = {
      programming_shutdown_date: moment
        .tz(CONFIG.timezone)
        .clone()
        .add(CONFIG.expiration, 's')
        .utc()
        .format(),
    };
    const opt_condition = {
      where: {
        id_application: application.id_application,
      },
    };

    return await Promise.resolve(
      db.cirrus.APPLICATION.update(opt_update, opt_condition)
    ).then((response) => {
      return 'The application expiration have been renewed.';
    });
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};

/**
 * Create an application in the database
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const create = async function (
  props = {
    id_user: undefined,
    id_environment: undefined,
    id_datacenter: undefined,
    custom_label: undefined,
    generated_label: undefined,
    hash: undefined,
    username: undefined,
    password: undefined,
    state_changed_date: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_user: undefined,
    id_environment: undefined,
    id_datacenter: undefined,
    custom_label: undefined,
    generated_label: undefined,
    hash: undefined,
    username: undefined,
    password: undefined,
    state_changed_date: undefined,
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
  if (!parametres.check_key(props.generated_label))
    throw new ParameterMisformed(
      'The props.generated_label parameter is misformed.'
    );
  if (!parametres.check_key(props.password))
    throw new ParameterMisformed('The props.password parameter is misformed.');
  try {
    // We find the state from different parameters.
    let creation_state = 'Scheduled';
    if (!CONFIG.ms_deployment_activated) creation_state = 'Ready';

    const esp_options = {
      where: { label: creation_state },
    };
    const id_enum_state_application = await Promise.resolve(
      db.cirrus.ENUM_STATE_APPLICATION.findOne(esp_options)
    ).then((r) => {
      if (r == null)
        throw new DBObjectNotFound('The state could not be found.');
      return r.id_enum_state_application;
    });

    // We prepare the creation of the application
    const options = {
      id_user: props.id_user,
      id_enum_state_application: id_enum_state_application,
      id_environment: props.id_environment,
      id_datacenter: props.id_datacenter,
      custom_label:
        props.custom_label === '' ? props.generated_label : props.custom_label,
      generated_label: props.generated_label,
      creation_date: moment.tz(CONFIG.timezone).utc().format(),
      hash: props.hash,
      username: props.username,
      password: props.password,
      state_changed_date: moment(props.state_changed_date)
        .tz(CONFIG.timezone)
        .utc()
        .format(),
      programming_shutdown_date:
        creation_state !== 'Ready'
          ? null
          : moment(props.state_changed_date)
              .tz(CONFIG.timezone)
              .clone()
              .add(CONFIG.expiration, 's')
              .utc()
              .format(),
    };
    return await Promise.resolve(db.cirrus.APPLICATION.create(options)).then(
      (r) => {
        return new Application({
          id_application: r.id_application,
          custom_label: r.custom_label,
          generated_label: r.generated_label,
          creation_date: moment(r.creation_date).tz(CONFIG.timezone),
          hash: r.hash,
          username: r.username,
          password: r.password,
          id_user: r.id_user,
          id_environment: r.id_environment,
          state_application: creation_state,
          state_changed_date: moment(r.state_changed_date).tz(CONFIG.timezone),
          programming_shutdown_date:
            r.programming_shutdown_date == null
              ? null
              : moment(r.programming_shutdown_date).tz(CONFIG.timezone),
          datacenter: undefined,
          environment: new Environment({
            id_environment: r.id_environment,
            label: '',
            icon: '',
          }),
        });
      }
    );
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};

/**
 * Check if the user is the owner of the application.
 * @param {*} param0
 * @returns
 */
export const is_owner = async function (
  props = {
    id_user: undefined,
    id_application: undefined,
    key: undefined,
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
  if (props.key === undefined && props.id_application === undefined)
    throw new MissingArgumentError(
      'You need to pass either id_application or key.'
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

  try {
    const whereOpt =
      props.key === undefined
        ? {
            [Op.and]: [
              { id_application: props.id_application },
              { id_user: props.id_user },
            ],
          }
        : {
            [Op.and]: [
              { generated_label: props.key },
              { id_user: props.id_user },
            ],
          };

    return await Promise.resolve(
      db.cirrus.APPLICATION.findOne({ where: whereOpt })
    ).then((r) => {
      return r != null;
    });
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};

/**
 * Builder used to check if the new key generated is available or already attributed.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const nameExists = async (
  props = {
    name: undefined,
  }
) => {
  // We check all mandatory props before doing anything
  const expected_props = {
    name: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_key(props.name))
    throw new ParameterMisformed('The props.name parameter is misformed.');
  const options = {
    where: {
      generated_label: props.name,
    },
  };
  return await Promise.resolve(db.cirrus.APPLICATION.findOne(options))
    .then((r) => {
      return r != null;
    })
    .catch((err) => {
      throw db.sequelizeErrorManagement(err);
    });
};

/**
 * Builder used to check if the new hash generated is available or already attributed.
 * @param {*} hash
 * @returns
 */
export const hashExists = async (
  props = {
    hash: undefined,
  }
) => {
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
  const options = {
    where: { hash: props.hash },
  };
  return await Promise.resolve(db.cirrus.APPLICATION.findOne(options))
    .then((r) => {
      return r != null;
    })
    .catch((err) => {
      throw db.sequelizeErrorManagement(err);
    });
};

/**
 * Delete an application from the database.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const deletion = async function (
  props = {
    id_application: undefined,
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
  try {
    // getting state for label 'Deleted'
    let options = {
      where: { label: 'Deleted' },
    };
    const id_enum_state_application = await Promise.resolve(
      db.cirrus.ENUM_STATE_APPLICATION.findOne(options)
    ).then((r) => {
      return r.id_enum_state_application;
    });

    const opt_update = {
      id_enum_state_application: id_enum_state_application,
    };

    options = {
      where: {
        id_application: props.id_application,
      },
    };
    return await Promise.resolve(
      db.cirrus.APPLICATION.update(opt_update, options)
    ).then((r) => {
      return r > 0;
    });
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};
/**
 * Delete an application from the database with a download.
 * @param {Object} props - The properties object.
 * @param {number} props.id_application - The ID of the application to delete.
 * @param {Function} [fns] - Optional callback functions.
 * @returns {Promise<boolean>} - Returns true if the deletion was successful.
 * @throws {MissingArgumentError} - If required arguments are missing.
 * @throws {ParameterMisformed} - If any parameter is malformed.
 * @throws {DBObjectNotFound} - If the application state cannot be found.
 */
export const download_deletion = async function (
  props = {
    id_application: undefined,
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
  try {
    // getting state for label 'DeletedLaunch'
    let options = {
      where: { label: 'DeletedLaunch' },
    };
    const id_enum_state_application = await Promise.resolve(
      db.cirrus.ENUM_STATE_APPLICATION.findOne(options)
    ).then((r) => {
      return r.id_enum_state_application;
    });

    const opt_update = {
      id_enum_state_application: id_enum_state_application,
    };

    options = {
      where: {
        id_application: props.id_application,
      },
    };
    return await Promise.resolve(
      db.cirrus.APPLICATION.update(opt_update, options)
    ).then((r) => {
      return r > 0;
    });
  } catch (err) {
    throw db.sequelizeErrorManagement(err);
  }
};

/**
 * Change the state of the application.
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const update_state = async function (
  props = {
    id_application: undefined,
    state_application: undefined,
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

  try {
    const options = {
      where: { label: props.state_application },
    };
    const id_enum_state_application = await Promise.resolve(
      db.cirrus.ENUM_STATE_APPLICATION.findOne(options)
    ).then((r) => {
      return r.id_enum_state_application;
    });

    const opt_update = {
      id_enum_state_application: id_enum_state_application,
      state_changed_date: moment.tz(CONFIG.timezone).utc().format(),
      programming_shutdown_date:
        props.state_application !== 'Ready'
          ? null
          : moment
              .tz(CONFIG.timezone)
              .clone()
              .add(CONFIG.expiration, 's')
              .utc()
              .format(),
    };
    const opt_condition = {
      where: {
        id_application: props.id_application,
      },
    };

    return await Promise.resolve(
      db.cirrus.APPLICATION.update(opt_update, opt_condition)
    ).then((r) => {
      if (r[0] === 0)
        throw new DBObjectNotFound('The application to update does not exist.');
      return r[0] > 0;
    });
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw db.sequelizeErrorManagement(err);
  }
};
