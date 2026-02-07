import { Op } from 'sequelize';
import dbManager from '../config/db.config.js';
import moment from 'moment-timezone';
import * as parametres from '../utils/parametres.service.js';
import {
  DBObjectNotFound,
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.service.js';
import { Application_export } from '../objects/application/Application_export.js';
import CONFIG from '../config/config.js';

/**
 * Create an application in the database
 * @param {*} props
 * @param {*} fns
 * @returns
 */
export const create = async function (
  props = {
    id_application: undefined,
    availability_days: undefined,
  }
) {
  const expected_props = {
    id_application: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_application)) {
    throw new ParameterMisformed(
      'The props.id_application parameter is misformed'
    );
  }
  try {
    // get id_enum_export_state of 'Launched'
    const id_enum_export_state = await getIdEnumState({ status: 'Launched' });

    // Create db entry
    const options = {
      id_application: props.id_application,
      init_date: moment().tz(CONFIG.APP_TZ).format(),
      expiration_date: moment()
        .tz(CONFIG.APP_TZ)
        .add(props.availability_days, 'days')
        .format(),
      id_enum_export_state: id_enum_export_state,
    };
    return await Promise.resolve(
      dbManager.models.APPLICATION_EXPORT.create(options)
    ).then((r) => {
      return new Application_export({
        id_export: r.id_export,
        init_date: r.init_date,
        id_application: r.id_application,
        expiration_date: r.expiration_date,
        id_enum_export_state: r.id_enum_export_state,
        status: 'Launched',
      });
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

export const get = async function (
  props = {
    id_export: undefined,
  }
) {
  const expected_props = {
    id_export: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_export)) {
    throw new ParameterMisformed('The props.id_export parameter is misformed');
  }
  try {
    const options = {
      where: { id_export: props.id_export },
    };
    return await Promise.resolve(
      dbManager.models.APPLICATION_EXPORT.findOne(options)
    ).then(async (r) => {
      if (r === null)
        throw new DBObjectNotFound(
          `The element id_export = '${props.id_export}' could not be found.`
        );
      const status = await getStatusFromId({
        id_enum_export_state: r.id_enum_export_state,
      });
      return new Application_export({
        id_export: r.id_export,
        init_date: r.init_date,
        id_application: r.id_application,
        expiration_date: r.expiration_date,
        id_provider: r.id_provider,
        download_link: r.download_link,
        id_enum_export_state: r.id_enum_export_state,
        status: status,
      });
    });
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};

export const getLatestStorage = async function (
  props = {
    id_application: undefined,
  }
) {
  const expected_props = {
    id_application: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_application)) {
    throw new ParameterMisformed(
      'The props.id_application parameter is misformed'
    );
  }
  try {
    const options = {
      where: {
        id_application: props.id_application,
        expiration_date: {
          [Op.gt]: moment().tz(CONFIG.APP_TZ).format(),
        },
      },
      order: [['init_date', 'DESC']],
    };
    return await Promise.resolve(
      dbManager.models.APPLICATION_EXPORT.findOne(options)
    ).then(async (r) => {
      if (r === null)
        return new Application_export({
          id_export: null,
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
      return new Application_export({
        id_export: r.id_export,
        init_date: r.init_date,
        id_application: r.id_application,
        expiration_date: r.expiration_date,
        id_provider: r.id_provider,
        download_link: r.download_link,
        id_enum_export_state: r.id_enum_export_state,
        status: status,
      });
    });
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};

export const getNonErrorApplicationStorage = async function (
  props = {
    id_application: undefined,
  }
) {
  const expected_props = {
    id_application: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_application)) {
    throw new ParameterMisformed(
      'The props.id_application parameter is misformed'
    );
  }
  try {
    const id_enum_available_states = await getIdsEnumStates({
      statuses: ['Launched', 'Exporting', 'Available'],
    });

    const options = {
      where: {
        id_application: props.id_application,
        expiration_date: {
          [Op.gt]: moment().tz(CONFIG.APP_TZ).format(),
        },
      },
      order: [['init_date', 'DESC']],
    };
    return await Promise.resolve(
      dbManager.models.APPLICATION_EXPORT.findOne(options)
    ).then(async (r) => {
      if (
        r !== null &&
        id_enum_available_states.includes(r.id_enum_export_state)
      ) {
        const status = await getStatusFromId({
          id_enum_export_state: r.id_enum_export_state,
        });
        return new Application_export({
          id_export: r.id_export,
          init_date: r.init_date,
          id_application: r.id_application,
          expiration_date: r.expiration_date,
          id_provider: r.id_provider,
          download_link: r.download_link,
          id_enum_export_state: r.id_enum_export_state,
          status: status,
        });
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
    });
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};

export const deleteExport = async function (
  props = {
    id_export: undefined,
  }
) {
  const expected_props = {
    id_export: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_export)) {
    throw new ParameterMisformed('The props.id_export parameter is misformed');
  }
  try {
    // get id_enum_export_state of 'Revoked'
    const opt_state = {
      where: { status: 'Revoked' },
    };
    const id_enum_export_state = await getIdEnumState({ status: 'Revoked' });

    // update db entry
    const opt_update = {
      id_enum_export_state: id_enum_export_state,
    };
    const opt_condition = {
      where: { id_export: props.id_export },
    };
    return await Promise.resolve(
      dbManager.models.APPLICATION_EXPORT.update(opt_update, opt_condition)
    ).then((r) => {
      if (r[0] === 0)
        throw new DBObjectNotFound('The export to update does not exist.');

      return new Application_export({
        id_export: r[0].id_export,
        init_date: r[0].init_date,
        id_application: r[0].id_application,
        expiration_date: r[0].expiration_date,
        id_enum_export_state: r[0].id_enum_export_state,
      });
    });
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};

export const setError = async function (
  props = {
    id_export: undefined,
  }
) {
  const expected_props = {
    id_export: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_export)) {
    throw new ParameterMisformed('The props.id_export parameter is misformed');
  }
  try {
    // get id_enum_export_state of 'Error'
    const id_enum_export_state = await getIdEnumState({ status: 'Error' });

    // update db entry
    const opt_update = {
      id_enum_export_state: id_enum_export_state,
    };
    const opt_condition = {
      where: { id_export: props.id_export },
    };
    return await Promise.resolve(
      dbManager.models.APPLICATION_EXPORT.update(opt_update, opt_condition)
    ).then((r) => {
      if (r[0] === 0)
        throw new DBObjectNotFound('The export to update does not exist.');

      return new Application_export({
        id_export: r[0].id_export,
        init_date: r[0].init_date,
        id_application: r[0].id_application,
        expiration_date: r[0].expiration_date,
        id_enum_export_state: r[0].id_enum_export_state,
      });
    });
  } catch (err) {
    if (err instanceof DBObjectNotFound) throw err;
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Get Id Enum State from the state name
 */
export const getIdEnumState = async function (
  props = {
    status: undefined,
  }
) {
  const expected_props = {
    status: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  const available_states = [
    'Launched',
    'Exporting',
    'Available',
    'Expired',
    'Revoked',
    'Error',
  ];
  if (!available_states.includes(props.status))
    throw new ParameterMisformed(
      `The state "${props.status}" is not available.`
    );

  const opt_state = {
    where: { status: props.status },
  };
  const id_enum_export_state = await Promise.resolve(
    dbManager.models.ENUM_EXPORT_STATE.findOne(opt_state)
  ).then((r) => {
    if (r == null)
      throw new DBObjectNotFound(
        `The state "${props.status}" could not be found.`
      );
    return r.id_enum_export_state;
  });

  return id_enum_export_state;
};

/**
 *  Get table of IDs for requested states names
 */

export const getIdsEnumStates = async function (
  props = {
    statuses: undefined,
  }
) {
  const expected_props = {
    statuses: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  const available_states = [
    'Launched',
    'Exporting',
    'Available',
    'Expired',
    'Revoked',
    'Error',
  ];
  const invalidStatuses = props.statuses.filter(
    (s) => !available_states.includes(s)
  );
  if (invalidStatuses.length > 0) {
    throw new ParameterMisformed(
      `The state(s) "${invalidStatuses.join(', ')}" are not available.`
    );
  }

  // Get all IDs for the requested statuses
  const opt_state = {
    where: { status: props.statuses },
  };

  const id_enum_export_states = await Promise.resolve(
    dbManager.models.ENUM_EXPORT_STATE.findAll(opt_state)
  ).then((results) => {
    if (results.length !== props.statuses.length) {
      const foundStatuses = results.map((r) => r.status);
      const missingStatuses = props.statuses.filter(
        (s) => !foundStatuses.includes(s)
      );
      throw new DBObjectNotFound(
        `The state(s) "${missingStatuses.join(', ')}" could not be found.`
      );
    }
    return results.map((r) => r.id_enum_export_state);
  });

  return id_enum_export_states;
};

/**
 *  Get status of an ID
 */
export const getStatusFromId = async function (
  props = {
    id_enum_export_state: undefined,
  }
) {
  const expected_props = {
    id_enum_export_state: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  const opt_state = {
    where: { id_enum_export_state: props.id_enum_export_state },
  };
  const status = await Promise.resolve(
    dbManager.models.ENUM_EXPORT_STATE.findOne(opt_state)
  ).then((result) => {
    if (!result) {
      throw new DBObjectNotFound(
        `The state with ID "${props.id_enum_export_state}" could not be found.`
      );
    }
    return result.status;
  });

  return status;
};
