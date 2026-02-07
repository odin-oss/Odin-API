import dbManager from '../config/db.config.js';
import * as parametres from '../utils/parametres.service.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.service.js';
import { Record, History } from '../objects/History.js';
import moment from 'moment-timezone';
import CONFIG from '../config/config.js';

/**
 * Add a record into the History when an user is accessing an application.
 * @param {*} props
 * @returns
 */
export const create = async function (
  props = {
    id_user: undefined,
    id_application: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_user: undefined,
    id_application: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_user))
    throw new ParameterMisformed('The props.id_user parameter is misformed.');
  if (!parametres.check_id(props.id_application))
    throw new ParameterMisformed(
      'The props.id_application parameter is misformed.'
    );

  try {
    const options = {
      id_user: props.id_user,
      id_application: props.id_application,
      datetime: moment.tz(CONFIG.APP_TZ).utc().format(),
    };
    return await Promise.resolve(dbManager.models.HISTORY.create(options)).then(
      (r) => {
        return new History({
          records: [
            new Record({
              id_user: r.id_user,
              id_application: r.lastname,
              id_history: r.id_history,
              datetime: moment(r.datetime).tz(CONFIG.APP_TZ),
            }),
          ],
        });
      }
    );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
/**
 * Get the last access by the owner of the application.
 * @param {*} props
 * @returns
 */
export const get_last_record = async function (
  props = {
    id_application: undefined,
    id_user: undefined,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    id_user: undefined,
    id_application: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_user))
    throw new ParameterMisformed('The props.id_user parameter is misformed.');
  if (!parametres.check_id(props.id_application))
    throw new ParameterMisformed(
      'The props.id_application parameter is misformed.'
    );

  try {
    const options = {
      limit: 1,
      where: {
        id_user: props.id_user,
        id_application: props.id_application,
      },
      order: [['datetime', 'DESC']],
    };
    return await Promise.resolve(
      dbManager.models.HISTORY.findOne(options)
    ).then((r) => {
      if (r == null) return new History();
      return new History({
        records: [
          new Record({
            id_user: r.id_user,
            id_application: r.id_application,
            id_history: r.id_history,
            datetime: moment(r.datetime).tz(CONFIG.APP_TZ),
          }),
        ],
      });
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
