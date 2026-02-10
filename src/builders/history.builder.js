import dbManager from '../config/db.config.js';
import { Record, History } from '../objects/History.js';
import moment from 'moment-timezone';
import CONFIG from '../config/config.js';
import Guard from '../utils/guard.util.js';
import z from 'zod';

/**
 * Add a record into the History when an user is accessing an application.
 * @param {Number} id_user id of the user to identify in history.
 * @param {Number} id_application id of the application to identify in history.
 * @returns {History}
 */
export const create = async function (props) {
  try {
    const schema = z.object({
      id_user: z.number().positive(),
      id_application: z.number().positive()
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      ...data,
      datetime: moment.tz(CONFIG.APP_TZ).utc().format(),
    };
    return await dbManager.models.HISTORY.create(options)
      .then(r => new History({
        records: [
          new Record({
            ...r,
            datetime: moment(r.datetime).tz(CONFIG.APP_TZ),
          }),
        ],
      })
      );
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
/**
 * Get the last access by the owner of the application.
 * @param {Number} id_user if of the user we want the last record
 * @param {Number} id_application if of the application we want the last record
 * @returns
 */
export const get_last_record = async function (props) {
  try {
    const schema = z.object({
      id_user: z.number().positive(),
      id_application: z.number().positive()
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      limit: 1,
      where: {
        id_user: data.id_user,
        id_application: data.id_application,
      },
      order: [['datetime', 'DESC']],
    };
    return await dbManager.models.HISTORY.findOne(options)
    .then((r) => {
      if (r == null) return new History();
      return new History({
        records: [
          new Record({
            ...r,
            datetime: moment(r.datetime).tz(CONFIG.APP_TZ),
          }),
        ],
      });
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
