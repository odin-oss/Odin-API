import { Op } from 'sequelize';
import dbManager from '../config/db.config.js';
import moment from 'moment-timezone';
import { DBObjectNotFound } from '../utils/errors.util.js';
import { Application_export } from '../objects/Application_export.js';
import CONFIG from '../config/config.js';
import Guard from '../utils/guard.util.js';
import z from 'zod';

/**
 * Create an application in the database
 * @param {Number} id_application id of the application
 * @param {Number} availability_days count of days when the link will be available.
 * @returns {Application_export}
 */
export const create = async function (props) {
  try {
    const schema = z.object({
      id_application: z.number().positive(),
      availability_days: z
        .number()
        .positive()
        .transform((val) =>
          moment()
            .tz(CONFIG.APP_TZ)
            .add(props.availability_days, 'days')
            .format()
        ),
    });
    const data = Guard.validateProps(schema, props);
    const id_enum_export_state = await getIdEnumState({ status: 'Launched' });

    const options = {
      id_application: data.id_application,
      init_date: moment().tz(CONFIG.APP_TZ).format(),
      expiration_date: data.availability_days,
      id_enum_export_state,
    };
    return await dbManager.models.APPLICATION_EXPORT.create(options).then(
      (r) =>
        new Application_export({
          ...r,
          status: 'Launched',
        })
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Get a spectific Application_export from the database.
 * @param {Number} id_export id of the Application_export
 * @returns {Application_export}
 */
export const get = async function (props) {
  try {
    const schema = z.object({
      id_export: z.number().positive(),
    });
    const data = Guard.validateProps(schema, props);
    return await dbManager.models.APPLICATION_EXPORT.findOne({
      where: { ...data },
    }).then(async (r) => {
      if (r === null)
        throw new DBObjectNotFound(
          `The element id_export = '${props.id_export}' could not be found.`
        );
      const status = await getStatusFromId({
        id_enum_export_state: r.id_enum_export_state,
      });
      return new Application_export({
        ...r,
        status: status,
      });
    });
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Get the last storage data for the specific application.
 * @param {Number} id_application id of the application which we want the Application_export
 * @returns {Application_export}
 */
export const getLatestStorage = async function (props) {
  try {
    const schema = z.object({
      id_application: z.number().positive(),
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      where: {
        id_application: data.id_application,
        expiration_date: {
          [Op.gt]: moment().tz(CONFIG.APP_TZ).format(),
        },
      },
      order: [['init_date', 'DESC']],
    };
    return await dbManager.models.APPLICATION_EXPORT.findOne(options).then(
      async (r) => {
        if (r === null)
          return new Application_export({
            ...r,
            init_date: null,
            id_application: props.id_application,
            expiration_date: null,
            id_provider: null,
            download_link: null,
            id_enum_export_state: null,
            status: null,
          });
        const status = await getStatusFromId({
          id_enum_export_state: r.id_enum_export_state,
        });
        return new Application_export({ ...r, status });
      }
    );
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Get Non Error Application Storage from id_application.
 * @param {Number} id_application id of the application.
 * @returns {Application_export}
 */
export const getNonErrorApplicationStorage = async function (props) {
  try {
    const schema = z.object({
      id_application: z.number().positive(),
    });
    const data = Guard.validateProps(schema, props);
    const id_enum_available_states = await getIdsEnumStates({
      statuses: ['Launched', 'Exporting', 'Available'],
    });
    const options = {
      where: {
        id_application: data.id_application,
        expiration_date: {
          [Op.gt]: moment().tz(CONFIG.APP_TZ).format(),
        },
      },
      order: [['init_date', 'DESC']],
    };
    return await dbManager.models.APPLICATION_EXPORT.findOne(options).then(
      async (r) => {
        if (
          r !== null &&
          id_enum_available_states.includes(r.id_enum_export_state)
        ) {
          const status = await getStatusFromId({
            id_enum_export_state: r.id_enum_export_state,
          });
          return new Application_export({ ...r, status });
        }
        return new Application_export({
          id_export: null,
          init_date: null,
          id_application: null,
          expiration_date: null,
          id_provider: null,
          download_link: null,
          id_enum_export_state: null,
          status: null,
        });
      }
    );
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Demete a specific export from the database.
 * @param {Number} id_export id of the export to delete.
 * @returns {Application_export}
 */
export const deleteExport = async function (props) {
  try {
    const schema = z.object({
      id_export: z.number().positive(),
    });
    const data = Guard.validateProps(schema, props);
    const id_enum_export_state = await getIdEnumState({ status: 'Revoked' });

    const opt_condition = {
      where: { id_export: data.id_export },
    };
    return await dbManager.models.APPLICATION_EXPORT.update(
      { id_enum_export_state },
      opt_condition
    ).then((r) => {
      if (r[0] === 0)
        throw new DBObjectNotFound('The export to update does not exist.');
      return new Application_export({ ...r[0] });
    });
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Set error state on a specific Application_export.
 * @param {Number} id_export id of the export to put error on.
 * @returns {Application_export}
 */
export const setError = async function (props) {
  try {
    const schema = z.object({
      id_export: z.number().positive(),
    });
    const data = Guard.validateProps(schema, props);
    const id_enum_export_state = await getIdEnumState({ status: 'Error' });

    // update db entry
    const opt_condition = {
      where: { id_export: data.id_export },
    };
    return await dbManager.models.APPLICATION_EXPORT.update(
      { id_enum_export_state },
      opt_condition
    ).then((r) => {
      if (r[0] === 0)
        throw new DBObjectNotFound('The export to update does not exist.');
      return new Application_export({ ...r[0] });
    });
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Get Id Enum State from the state name
 * @param {String} status state we want the id of
 * @returns {Number}
 */
export const getIdEnumState = async function (props) {
  const schema = z.object({
    status: z.enum([
      'Launched',
      'Exporting',
      'Available',
      'Expired',
      'Revoked',
      'Error',
    ]),
  });
  const data = Guard.validateProps(schema, props);
  return await dbManager.models.ENUM_EXPORT_STATE.findOne({
    where: { ...data },
  }).then((r) => {
    if (r == null)
      throw new DBObjectNotFound(
        `The state "${props.status}" could not be found.`
      );
    return r.id_enum_export_state;
  });
};

/**
 * Get table of IDs for requested states names
 * @param {Array<String>} statuses list of status we want the ids
 * @returns {Array<Number>}
 */
export const getIdsEnumStates = async function (props) {
  const schema = z.object({
    statuses: z.array(
      z.enum([
        'Launched',
        'Exporting',
        'Available',
        'Expired',
        'Revoked',
        'Error',
      ])
    ),
  });
  const data = Guard.validateProps(schema, props);
  const opt_state = {
    where: { status: data.statuses },
  };
  return await dbManager.models.ENUM_EXPORT_STATE.findAll(opt_state).then(
    (results) => {
      if (results.length !== data.statuses.length) {
        const foundStatuses = results.map((r) => r.status);
        const missingStatuses = data.statuses.filter(
          (s) => !foundStatuses.includes(s)
        );
        throw new DBObjectNotFound(
          `The state(s) "${missingStatuses.join(', ')}" could not be found.`
        );
      }
      return results.map((r) => r.id_enum_export_state);
    }
  );
};

/**
 * Get status from an ID
 * @param {Number} id_enum_export_state id of the export state we want
 * @returns {String}
 */
export const getStatusFromId = async function (props) {
  const schema = z.object({
    id_enum_export_state: z.number().positive(),
  });
  const data = Guard.validateProps(schema, props);
  const opt_state = {
    where: { ...data },
  };
  return await dbManager.models.ENUM_EXPORT_STATE.findOne(opt_state).then(
    (result) => {
      if (!result) {
        throw new DBObjectNotFound(
          `The state with ID "${data.id_enum_export_state}" could not be found.`
        );
      }
      return result.status;
    }
  );
};
