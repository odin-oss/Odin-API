import logger from '../middlewares/winston.js';
import {
  create,
  exec_deletion,
  exec_shutdown,
} from '../services/deployment.service.js';
import {
  getApplicationToDelete,
  getApplicationToShutdown,
  update_state,
} from '../builders/applications.builder.js';
import { getScheduledApplications } from '../services/applications.service.js';
import { getSessionToShutdown } from '../builders/session.builder.js';

/**
 * Method that is launching all scheduled applications.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Number} count of applications that have been started.
 */
export const launch_scheduled_applications = async (
  fns = {
    getScheduledApplications,
    create,
    update_state,
  }
) => {
  try {
    const applications_to_launch = await fns.getScheduledApplications();
    const promises = [];
    for (const application of applications_to_launch) {
      promises.push(fns.create(application));
      promises.push(
        fns.update_state({
          hash: application.hash,
          state_application: 'Getting ready',
        })
      );
    }
    return await Promise.all(promises).then(
      (r) => applications_to_launch.length
    );
  } catch (err) {
    logger.debug(err);
    logger.error(`[${err.name}] ${err.message}`);
    throw err;
  }
};

/**
 * Method that is stopping all applications that needs to be stopped.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Number} count of applications that have been stopped.
 */
export const launch_stop_applications = async (
  fns = {
    getApplicationToShutdown,
    exec_shutdown,
    update_state,
  }
) => {
  try {
    const applications_to_stop = await fns.getApplicationToShutdown();
    const promises = [];
    for (const application of applications_to_stop) {
      promises.push(
        fns.exec_shutdown({
          hash: application.hash,
          datacenter: application.datacenter,
        })
      );
      promises.push(
        fns.update_state({
          hash: application.hash,
          state_application: 'Off',
        })
      );
    }
    return await Promise.all(promises).then((r) => {
      return applications_to_stop.length;
    });
  } catch (err) {
    logger.debug(err);
    logger.error(`[${err.name}] ${err.message}`);
    throw err;
  }
};

/**
 * Method that is stopping all sessions that needs to be stopped.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Number} count of sessions that have been stopped.
 */
export const launch_stop_sessions = async (
  fns = {
    getSessionToShutdown,
    exec_shutdown,
    update_state,
  }
) => {
  try {
    const sessions_to_stop = await fns.getSessionToShutdown();
    const promises = [];
    for (const app of sessions_to_stop) {
      promises.push(
        fns.exec_shutdown({
          hash: app.hash,
          datacenter: app.datacenter,
        })
      );
      promises.push(
        fns.update_state({
          hash: app.hash,
          state_application: 'EndedSession',
        })
      );
    }
    return await Promise.all(promises).then(() => sessions_to_stop.length);
  } catch (err) {
    logger.debug(err);
    logger.error(`[${err.name}] ${err.message}`);
    throw err;
  }
};

/**
 * Method that is deleting all apps that needs to be deleted after being downloaded.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Number} count of applications that have been deleted.
 */
export const launch_delete_apps = async (
  fns = {
    getApplicationToDelete,
    exec_deletion,
    update_state,
  }
) => {
  try {
    const apps_to_delete = await fns.getApplicationToDelete();
    const promises = [];
    for (const app of apps_to_delete) {
      promises.push(
        fns.exec_deletion({
          hash: app.hash,
          datacenter: app.datacenter,
        })
      );
      promises.push(
        fns.update_state({
          hash: app.hash,
          state_application: 'Deleted',
        })
      );
    }
    return await Promise.all(promises).then((r) => apps_to_delete.length);
  } catch (err) {
    logger.debug(err);
    logger.error(`[${err.name}] ${err.message}`);
    throw err;
  }
};
