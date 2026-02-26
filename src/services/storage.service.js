import moment from 'moment-timezone';
import * as application_builder from '../builders/applications.builder.js';
import * as application_service from './applications.service.js';
import * as storage_builder from '../builders/storage.builder.js';
import * as environment_builder from '../builders/environment.builder.js';
import * as user_builder from '../builders/user.builder.js';
import { smashExport } from '../objects/kubernetes/storage-carrier.js';
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
 * Service that execute the export workflow of an application.
 * @param {Number} id_application id of the application we want to export the storage.
 * @param {Boolean} delete_existing_export should we delete the existing export object - optional.
 * @param {Boolean} app_deletion should the application be deleted - default false.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Application_export}
 */
export const exportStorage = async function (
  props,
  fns = {
    user_get: user_builder.get,
    environment_get: environment_builder.get,
    application_get: application_service.get,
    get_application_export: storage_builder.getNonErrorApplicationStorage,
    storage_create: storage_builder.create,
    exec_smash_export: smashExport,
    service_delete_storage: deleteStorage,
  }
) {
  const schema = z.object({
    id_application: z.coerce.number().positive(),
    delete_existing_export: z.boolean().optional(),
    app_deletion: z.boolean().default(false),
  });
  const data = Guard.validateProps(schema, props);
  let previous_export_deleted = false;
  const application = await fns.application_get({
    id_application: data.id_application,
  });
  const user = await fns.user_get({ id_user: application.id_user });
  const application_shutdown_states = ['Off', 'EndedSession', 'DeletedLaunch'];
  if (!application_shutdown_states.includes(application.state_application)) {
    throw new StorageError('The application must be shutdown first.');
  }
  const applicationStorage = await fns.get_application_export({
    id_application: data.id_application,
  });
  const existing_states = ['Launched', 'Exporting'];
  if (applicationStorage.id_export && !data.delete_existing_export)
    throw new StorageAlreadyExists(
      'Storage already exists for this application.'
    );
  else if (
    applicationStorage.status === 'Available' &&
    data.delete_existing_export
  ) {
    await fns.service_delete_storage({
      id_application: data.id_application,
      id_export: applicationStorage.id_export,
    });
    previous_export_deleted = true;
  } else if (
    existing_states.includes(applicationStorage.status) &&
    data.delete_existing_export
  ) {
    throw new StorageAlreadyExists(
      'An Export is already in progress. Current status: ' +
        applicationStorage.status
    );
  }

  const environment_infos = await fns.environment_get({
    id_environment: application.id_environment,
  });

  const interfacesWithStorage = environment_infos.interfaces
    .filter((interfaces) => interfaces.envs.some((env) => env.key === 'HSTORAGE' && env.value === 'true'));
  if (interfacesWithStorage.length === 0)
    throw new StorageError('Storage is not enabled for this environment.');


  // Create storage export in database
  const promises = [
    fns
      .storage_create({
        id_application: data.id_application,
        availability_days: 1,
      })
      .then((application_export) => {
        fns
          .exec_smash_export({
            hash: application.hash,
            upload_id: application_export.id_export?.toString(),
            label: selectedInterface?.label?.toLowerCase(),
            app_deletion: data.app_deletion,
            folder_path: `/home/${application.username}/`,
            storage_carrier_image: CONFIG.SMASH_STORAGE_CARRIER_IMAGE,
            storage_carrier_image_tag: CONFIG.SMASH_STORAGE_CARRIER_IMAGE_TAG,
            smash_api_key: CONFIG.SMASH_STORAGE_CARRIER_API_KEY,
            smash_region: CONFIG.SMASH_STORAGE_CARRIER_REGION,
            smash_teamid: CONFIG.SMASH_STORAGE_CARRIER_TEAMID,
            web_title: application.custom_label,
            upload_description: `${application.custom_label} Odin environment export from ${moment().format('YYYY-MM-DD HH:mm:ss')} (${moment.tz(moment.tz.guess()).format('z')})`,
            export_language: 'fr',
            availability: '30',
            sender_name: CONFIG.STORAGE_CARRIER_SENDER_NAME,
            sender_email: CONFIG.STORAGE_CARRIER_SENDER_EMAIL,
            receiver_email: user.mail,
            datacenter: application.datacenter,
          })
          .catch((error) => {
            console.error('Error executing smash export:', error);
          });
        return application_export;
      }),
  ];

  return await Promise.all(promises).then((r) => {
    r[0].previous_export_deleted = previous_export_deleted;
    return r[0];
  });
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
