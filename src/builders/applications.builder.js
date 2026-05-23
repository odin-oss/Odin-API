import { literal, Op } from 'sequelize';
import moment from 'moment-timezone';
import z from 'zod';
import CONFIG from '../config/config.js';
import dbManager from '../config/db.config.js';
import {
  DBObjectNotFound,
  MissingArgumentError,
} from '../utils/errors.util.js';
import { Application } from '../objects/Application.js';
import { Environment } from '../objects/Environment.js';
import { Datacenter } from '../objects/Datacenter.js';
import logs from '../middlewares/winston.js';
import Guard from '../utils/guard.util.js';

/**
 * Get a specific application from its id || key || hash.
 * @param {Number} id_application id of the application to get.
 * @param {Number} key key of the application to get.
 * @param {Number} hash hash of the application to get.
 * @returns {Application}
 */
export const get = async function (props) {
  try {
    const schema = z.object({
      id_application: z.coerce.number().positive().optional(),
      key: z.string().optional(),
      hash: z.string().min(6).max(6).optional(),
    });
    if (!props.id_application && !props.key && !props.hash)
      throw new MissingArgumentError(
        'Either id_application, key, hash must be sent.'
      );
    const data = Guard.validateProps(schema, props);
    const options = {
      where: {},
      include: [
        {
          model: dbManager.models.ENUM_STATE_APPLICATION,
          required: true,
        },
        {
          model: dbManager.models.ENVIRONMENT,
          required: true,
        },
      ],
    };
    if (data.id_application !== undefined)
      options.where.id_application = data.id_application;
    if (data.key !== undefined) options.where.generated_label = data.key;
    if (data.hash !== undefined) options.where.hash = data.hash;
    return await dbManager.models.APPLICATION_ORDER.findOne(options).then(
      (r) => {
        if (r === null)
          throw new DBObjectNotFound(
            `The element id_application = '${data.id_application}' could not be found.`
          );
        return new Application({
          ...r.dataValues,
          state_application: r.ENUM_STATE_APPLICATION.label,
          datacenter: new Datacenter(r),
          environment: new Environment(r.ENVIRONMENT),
        });
      }
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Get the Application list from id_user.
 * @param {Number} id_user id of the user.
 * @param {Number} id_datacenter id of the datacenter.
 * @returns {Array<Application>}
 */
export const list = async function (props = {}) {
  try {
    const schema = z.object({
      id_user: z.coerce.number().positive().optional(),
      id_datacenter: z.coerce.number().positive().optional(),
      filter: z.array(z.string()).optional(),
      states: z.array(z.string()).optional(),
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      include: [
        {
          model: dbManager.models.ENUM_STATE_APPLICATION,
          required: true,
        },
        {
          model: dbManager.models.ENVIRONMENT,
          required: true,
        },
      ],
    };
    if (data.filter)
      options.include[0].where = { label: { [Op.in]: data.filter } };
    if (data.states)
      options.include[0].where = {
        ...options.include[0].where,
        label: { [Op.in]: data.states },
      };
    if (data.id_user) options.where = { id_user: data.id_user };
    if (data.id_datacenter)
      options.where = { id_datacenter: data.id_datacenter };

    return await dbManager.models.APPLICATION_ORDER.findAll(options).then((r) =>
      r.map(
        (app) =>
          new Application({
            ...app.dataValues,
            state_application: app.ENUM_STATE_APPLICATION.label,
            datacenter: new Datacenter({ id_datacenter: app.id_datacenter }),
            environment: new Environment(app.ENVIRONMENT),
          })
      )
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Renew the application expiration date using the constant CONFIG.USER_APPS_EXPIRATION_HOURS
 * @param {Number} id_application id of the application to renew
 * @returns {Application}
 */
export const renew_expiration = async function (props) {
  try {
    const schema = z.object({
      id_application: z.number().positive(),
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      where: {
        id_application: data.id_application,
      },
    };
    const application =
      await dbManager.models.APPLICATION_ORDER.findOne(options);
    if (application == null)
      throw new DBObjectNotFound('The application could not be found.');

    const opt_update = {
      programming_shutdown_date: moment
        .tz(CONFIG.APP_TZ)
        .clone()
        .add(CONFIG.USER_APPS_EXPIRATION_HOURS, 's')
        .utc()
        .format(),
    };
    const opt_condition = {
      where: {
        id_application: application.id_application,
      },
    };

    return await dbManager.models.APPLICATION_ORDER.update(
      opt_update,
      opt_condition
    ).then(() => 'The application expiration have been renewed.');
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Create an application in the database
 * @param {Number} id_user id of the user.
 * @param {Number} id_environment id of the environment.
 * @param {Number} id_datacenter id of the datacenter.
 * @param {String} custom_label custom label of the application.
 * @param {String} generated_label generated label of the application.
 * @param {String} hash unique hash of the application.
 * @param {String} username username of the application.
 * @param {String} password password of the application.
 * @param {String || moment} state_changed_date datatime when the application is started // scheduled - last update of state.
 * @returns { Application }
 */
export const create = async function (props) {
  try {
    const schema = z.object({
      id_user: z.number().positive(),
      id_environment: z.number().positive(),
      id_datacenter: z.number().positive(),
      custom_label: z.string().min(1),
      generated_label: z.string().min(8),
      hash: z.string().min(6).max(6),
      username: z.string().min(1),
      password: z.string().min(1),
      state_changed_date: z
        .refine((val) => moment(val).isValid(), {
          message: 'Invalid date format',
        })
        .transform((val) => moment(val).tz(CONFIG.APP_TZ))
        .default(moment.tz(CONFIG.APP_TZ)),
    });
    const data = Guard.validateProps(schema, props);
    // We find the state from different parameters.
    const esp_options = {
      where: { label: 'Scheduled' },
    };
    const state_application =
      await dbManager.models.ENUM_STATE_APPLICATION.findOne(esp_options).then(
        (r) => {
          if (r == null)
            throw new DBObjectNotFound('The state could not be found.');
          return r;
        }
      );

    // We prepare the creation of the application
    const options = {
      ...data,
      state_changed_date: data.state_changed_date.utc().format(),
      id_enum_state_application: state_application.id_enum_state_application,
      custom_label:
        data.custom_label === '' ? data.generated_label : data.custom_label,
      creation_date: moment.tz(CONFIG.APP_TZ).utc().format(),
      programming_shutdown_date: moment(data.state_changed_date)
        .tz(CONFIG.APP_TZ)
        .clone()
        .add(CONFIG.USER_APPS_EXPIRATION_HOURS, 's')
        .utc()
        .format(),
    };
    const app = await dbManager.models.APPLICATION_ORDER.create(options).then(
      (r) => {
        return new Application({
          ...data,
          id_application_order: r.id_application_order,
          datacenter: undefined,
          state_application: state_application.label,
          environment: new Environment({
            id_environment: r.id_environment,
          }),
        });
      }
    );

    return await dbManager.models.APPLICATION.create({
      id_application_order: app.id_application_order,
      id_enum_state_application: state_application.id_enum_state_application,
    }).then((res) => {
      app.id_application = res.id_application;
      return app;
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Check if the user is the owner of the application.
 * @param {Number} id_user id of the user
 * @param {String} key unique key of the application.(optionnal)
 * @param {Number} id_application id of the application
 * @returns {Boolean}
 */
export const is_owner = async function (props) {
  try {
    const schema = z.object({
      id_user: z.number().positive(),
      key: z.string().min(2).optional(),
      id_application: z.coerce.number().positive().optional(),
    });
    const data = Guard.validateProps(schema, props);
    const whereOpt =
      data.key === undefined
        ? {
            [Op.and]: [
              { id_application: data.id_application },
              { id_user: data.id_user },
            ],
          }
        : {
            [Op.and]: [
              { generated_label: data.key },
              { id_user: data.id_user },
            ],
          };

    return await dbManager.models.APPLICATION_ORDER.findOne({
      where: whereOpt,
    }).then((r) => r != null);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Builder used to check if the new key generated is available or already attributed.
 * @param {String} name name of the application
 * @returns {Boolean}
 */
export const nameExists = async (props) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      where: {
        generated_label: data.name,
      },
    };
    return await dbManager.models.APPLICATION_ORDER.findOne(options).then(
      (r) => r != null
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Builder used to check if the new hash generated is available or already attributed.
 * @param {String} hash hash to check
 * @returns {Boolean}
 */
export const hashExists = async (props) => {
  try {
    const schema = z.object({
      hash: z.string().min(6).max(6),
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      where: { hash: data.hash },
    };
    return await dbManager.models.APPLICATION_ORDER.findOne(options).then(
      (r) => r != null
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Delete an application from the database.
 * @param {Number} id_application id of the application to delete.
 * @returns {Application}
 */
export const deletion = async function (props) {
  try {
    const schema = z.object({
      id_application: z.number().positive(),
    });
    const data = Guard.validateProps(schema, props);
    // getting state for label 'Deleted'
    let options = {
      where: { label: 'Deleted' },
    };
    const id_enum_state_application =
      await dbManager.models.ENUM_STATE_APPLICATION.findOne(options).then(
        (r) => r.id_enum_state_application
      );

    const opt_update = {
      id_enum_state_application: id_enum_state_application,
    };

    options = {
      where: {
        id_application: data.id_application,
      },
    };
    return await dbManager.models.APPLICATION_ORDER.update(
      opt_update,
      options
    ).then((r) => r > 0);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
/**
 * Delete an application from the database with a download.
 * @param {Number} id_application id of the application.
 * @returns {Boolean}
 */
export const download_deletion = async function (props) {
  try {
    const schema = z.object({
      id_application: z.number().positive(),
    });
    const data = Guard.validateProps(schema, props);
    // getting state for label 'DeletedLaunch'
    let options = {
      where: { label: 'DeletedLaunch' },
    };
    const id_enum_state_application =
      await dbManager.models.ENUM_STATE_APPLICATION.findOne(options).then(
        (r) => r.id_enum_state_application
      );
    return await dbManager.models.APPLICATION_ORDER.update(
      { id_enum_state_application },
      { where: { id_application: data.id_application } }
    ).then((r) => r > 0);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Change the state of the application order.
 * @param {Number} id_application id of the application to update.
 * @param {String} state_application state of the application
 * @returns {Boolean}
 */
export const update_state = async function (props) {
  try {
    const schema = z.object({
      id_application: z.number().positive().optional(),
      hash: z.string().min(6).max(6).optional(),
      state_application: z.enum(['Off', 'Ready', 'Getting ready']),
    });
    const data = Guard.validateProps(schema, props);
    if (!data.id_application && !data.hash)
      throw new MissingArgumentError(
        'You must provide either hash or id_application.'
      );
    const options = {
      where: { label: data.state_application },
    };
    const id_enum_state_application =
      await dbManager.models.ENUM_STATE_APPLICATION.findOne(options).then(
        (r) => r.id_enum_state_application
      );
    const opt_update = {
      id_enum_state_application: id_enum_state_application,
      state_changed_date: moment.tz(CONFIG.APP_TZ).utc().format(),
      programming_shutdown_date:
        data.state_application === 'Ready'
          ? moment
              .tz(CONFIG.APP_TZ)
              .clone()
              .add(CONFIG.USER_APPS_EXPIRATION_HOURS, 'h')
              .utc()
              .format()
          : null,
    };
    const opt_condition = { where: {} };
    if (data.id_application)
      opt_condition.where.id_application = data.id_application;
    else opt_condition.where.hash = data.hash;

    return await dbManager.models.APPLICATION_ORDER.update(
      opt_update,
      opt_condition
    ).then((r) => {
      if (r[0] === 0)
        throw new DBObjectNotFound('The application to update does not exist.');
      return r[0] > 0;
    });
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Change the state of the application (from agent).
 * @param {String} hash unique hash used to identify the application.
 * @param {String} state_application state of the application
 * @param {String} uuid uuid of the agent that send the update. (checking if the agent is allowed to update the application)
 * @returns {Boolean}
 */
export const update_live_state = async function (props) {
  try {
    const schema = z.object({
      hash: z.string().min(6).max(6),
      state_application: z.enum(['Off', 'Ready', 'Getting ready']),
      uuid: z.string().uuid(),
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      where: { label: data.state_application },
    };
    const id_enum_state_application =
      await dbManager.models.ENUM_STATE_APPLICATION.findOne(options).then(
        (r) => r.id_enum_state_application
      );

    // Get the application order from the hash
    const application_order = await dbManager.models.APPLICATION_ORDER.findOne({
      where: { hash: data.hash },
    });
    if (application_order == null) {
      logs.debug('The application to update does not exist.');
      return false;
    }

    // Check if the agent is allowed to update the application
    const agent_environments = await dbManager.models.DATACENTER.findOne({
      where: {
        id_datacenter: application_order.id_datacenter,
      },
      include: [
        { model: dbManager.models.AGENT, where: { id_agent: data.uuid } },
      ],
    });

    // Updating the state of the application
    const opt_update = {
      id_enum_state_application: id_enum_state_application,
      last_update: moment.tz(CONFIG.APP_TZ).utc().format(),
    };
    const opt_condition = {
      where: { id_application_order: application_order.id_application_order },
    };

    return await dbManager.models.APPLICATION.update(
      opt_update,
      opt_condition
    ).then((r) => {
      if (r[0] === 0)
        throw new DBObjectNotFound('The application to update does not exist.');
      return r[0] > 0;
    });
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Builder that updates an application export state
 * @param {Number} id_export id of the export.
 * @param {Number} id_provider id of the provider that is doing the export.
 * @param {String} hash unique hash used to identify the application.
 * @param {String} state new state of the application.
 * @param {String} app_deletion do we delete the application at the end.
 * @param {String} download_link download_link to give to the user.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Array<Application>}
 */
export const update_application_export_state = async function (
  props,
  fns = {
    update_state,
  }
) {
  try {
    const schema = z.object({
      id_export: z.coerce.number().int().positive(),
      id_provider: z.coerce.number().int().positive().optional(),
      hash: z.string().min(6).max(6),
      state: z.enum(['Exporting', 'Available', 'Error']),
      app_deletion: z
        .preprocess((val) => String(val).toLocaleLowerCase(), z.string())
        .transform((val) => val === 'true')
        .default(false),
      download_link: z.string().optional(),
    });
    const data = Guard.validateProps(schema, props);
    const id_enum_export_state =
      await dbManager.models.ENUM_EXPORT_STATE.findOne({
        where: { status: data.state },
      }).then((r) => {
        if (r == null)
          throw new DBObjectNotFound(
            'The state ' + data.state + ' could not be found.'
          );
        return r.id_enum_export_state;
      });

    const opt_update = { id_enum_export_state };
    if (data.id_provider) opt_update.id_provider = data.id_provider;
    if (data.download_link) opt_update.download_link = data.download_link;

    const opt_condition = { where: { id_export: data.id_export } };

    if (data.app_deletion) {
      const state =
        data.state === 'Exporting' ? 'DeletedDownload' : 'DeletedError';
      await fns.update_state({
        hash: data.hash,
        state_application: data.state === 'Available' ? 'DeletedDone' : state,
      });
    }

    return await dbManager.models.APPLICATION_EXPORT.update(
      opt_update,
      opt_condition
    ).then((r) => {
      if (r[0] === 0)
        throw new DBObjectNotFound(
          'The application export could not be found.'
        );
      return r[0] > 0;
    });
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};
/**
 * Builder that get the list of all scheduled applications to launch.
 * @returns {Array<Application>}
 */
export const getScheduledApplications = async function () {
  const options = {
    include: [
      {
        model: dbManager.models.DATACENTER,
        required: true,
      },
      {
        model: dbManager.models.ENUM_STATE_APPLICATION,
        required: true,
        where: {
          label: 'Scheduled',
        },
      },
      {
        model: dbManager.models.ENVIRONMENT,
        required: true,
      },
    ],
    where: {
      state_changed_date: {
        [Op.lt]: literal(
          `DATE_TRUNC('minute', NOW() AT TIME ZONE '${CONFIG.APP_TZ}' + INTERVAL '1 minute')`
        ),
      },
    },
  };
  return await dbManager.models.APPLICATION_ORDER.findAll(options)
    .then((applications) => {
      const result = [];
      for (const application of applications) {
        result.push(
          new Application({
            ...application.dataValues,
            state_application: application.ENUM_STATE_APPLICATION.label,
            environment: new Environment({
              ...application.ENVIRONMENT.dataValues,
            }),
            datacenter: new Datacenter({
              ...application.DATACENTER.dataValues,
            }),
          })
        );
      }
      return result;
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};

/**
 * Builder that get the list of all applications scheduled to be stopped.
 * @returns {Array<Application>}
 */
export const getApplicationToShutdown = async function () {
  const options = {
    include: [
      {
        model: dbManager.models.DATACENTER,
        required: true,
      },
      {
        model: dbManager.models.ENUM_STATE_APPLICATION,
        where: {
          [Op.or]: [
            {
              label: 'Ready',
            },
            {
              label: 'Getting ready',
            },
          ],
        },
      },
      {
        model: dbManager.models.ENVIRONMENT,
        required: true,
      },
    ],
    where: {
      programming_shutdown_date: {
        [Op.lt]: literal(
          `DATE_TRUNC('minute', NOW() AT TIME ZONE '${CONFIG.APP_TZ}')`
        ),
      },
    },
  };
  return await dbManager.models.APPLICATION_ORDER.findAll(options)
    .then((applications) => {
      const result = [];
      for (const application of applications) {
        result.push(
          new Application({
            ...application.dataValues,
            state_application: application.ENUM_STATE_APPLICATION.label,
            environment: new Environment({
              ...application.ENVIRONMENT.dataValues,
            }),
            datacenter: new Datacenter({
              ...application.DATACENTER.dataValues,
            }),
          })
        );
      }
      return result;
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};

/**
 * Builder that get the list of all applications scheduled to be deleted after being downloaded.
 * @returns {Array<Application>}
 */
export const getApplicationToDelete = async function () {
  const options = {
    include: [
      {
        model: dbManager.models.DATACENTER,
        required: true,
      },
      {
        model: dbManager.models.ENUM_STATE_APPLICATION,
        where: {
          label: 'DeletedDone',
        },
      },
      {
        model: dbManager.models.ENVIRONMENT,
        required: true,
      },
    ],
  };
  return await dbManager.models.APPLICATION_ORDER.findAll(options)
    .then((applications) => {
      const result = [];
      for (const application of applications) {
        result.push(
          new Application({
            ...application.dataValues,
            state_application: application.ENUM_STATE_APPLICATION.label,
            environment: new Environment({
              ...application.ENVIRONMENT.dataValues,
            }),
            datacenter: new Datacenter({
              ...application.DATACENTER.dataValues,
            }),
          })
        );
      }
      return result;
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};
