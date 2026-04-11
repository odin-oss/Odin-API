import moment from 'moment-timezone';
import * as application_builder from '../builders/applications.builder.js';
import * as application_service from './applications.service.js';
import * as storage_builder from '../builders/storage.builder.js';
import * as environment_builder from '../builders/environment.builder.js';
import * as user_builder from '../builders/user.builder.js';
import CONFIG from '../config/config.js';
import { exec_transfer_deletion } from '../modules/smash-api.module.js';
import {
  ParameterMisformed,
  StorageAlreadyExists,
  StorageError,
  SmashAPIError,
} from '../utils/errors.util.js';
import Guard from '../utils/guard.util.js';
import z from 'zod';
import { Application_export } from '../objects/Application_export.js';
/**
 * Service that gives the latest active storage.
 * @param {Number} id_application id of the application we want the storage infos.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Application_export}
 */
export const getStorage = async function (
  props,
  fns = {
    get_storage: storage_builder.getLatestStorage,
  }
) {
  const schema = z.object({
    id_application: z.coerce.number().positive(),
  });
  const data = Guard.validateProps(schema, props);
  const promises = [fns.get_storage({ ...data })];
  return await Promise.all(promises).then((r) => r[0]);
};

/**
 * Service that execute the deletion of an export.
 * @param {Number} id_application id of the application we need to delete the storage.
 * @param {Number} id_export id of the export we want to get.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Application_export}
 */
export const deleteStorage = async function (
  props,
  fns = {
    export_get: storage_builder.get,
    application_get: application_builder.get,
    exec_smash_deletion: exec_transfer_deletion,
    storage_revokation: storage_builder.deleteExport,
    storage_error: storage_builder.setError,
  }
) {
  const schema = z.object({
    id_application: z.coerce.number().positive(),
    id_export: z.coerce.number().positive(),
  });
  const data = Guard.validateProps(schema, props);
  const application_export = await fns.export_get({ ...data });
  const application = await fns.application_get({
    id_application: application_export.id_application,
  });
  if (data.id_application.toString() !== application.id_application.toString())
    throw new ParameterMisformed(
      'The data.id_application parameter does not match the export id.'
    );

  const promises = [
    fns
      .exec_smash_deletion({
        transfer_id: application_export.id_provider,
      })
      .then((response) => {
        if (response.transfer && response.transfer.status === 'Deleting') {
          return fns.storage_revokation({
            id_export: data.id_export,
          });
        } else if (
          response.code === 404 ||
          response.code === 403 ||
          response.code === 500
        ) {
          fns.storage_error({
            id_export: data.id_export,
          });
          throw new SmashAPIError(response.error, response.code);
        }
        //Catching Unauthorized & Forbidden to set db in error
        else if (response.code == 401) {
          console.error('Check SmashAPI key');
          throw new SmashAPIError(response.message, response.code);
        } else {
          throw new SmashAPIError(
            'Something went wrong contacting SmashAPI',
            500
          );
        }
      }),
  ];

  return await Promise.all(promises).then((r) => r[0]);
};
