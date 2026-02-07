import moment from 'moment-timezone';
import * as application_builder from '../../builders/applications.builder.js';
import * as application_service from '../../services/applications.service.js';
import * as storage_builder from '../../builders/application/storage.builder.js';
import * as datacenter_builder from '../../builders/datacenter.builder.js';
import * as environment_builder from '../../builders/environment.builder.js';
import * as user_builder from '../../builders/user.builder.js';
import CONFIG from '../../config/config.js';
import { exec_smash_export } from '../../modules/ms-deployment.module.js';
import { exec_transfer_deletion } from '../../modules/smash-api.module.js';
import {
  MissingArgumentError,
  ParameterMisformed,
  StorageAlreadyExists,
  StorageError,
  SmashAPIError,
} from '../../utils/errors.service.js';
import * as parametres from '../../utils/parametres.service.js';
/**
 * Service that gives the latest active storage.
 * @param {*} props {id_application}
 * @param {*} fns overwriting functions for tests
 * @returns Application_export {}
 */
export const getStorage = async function (
  props = {
    id_application: undefined,
  },
  fns = {
    get_storage: storage_builder.getLatestStorage,
  }
) {
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

  const promises = [fns.get_storage({ id_application: props.id_application })];

  return await Promise.all(promises).then((r) => {
    return r[0];
  });
};

/**
 * Service that execute the export workflow of an application.
 * @param {*} props {id_user, id_application}
 * @param {*} fns overwriting functions for tests
 * @returns Application_export {}
 */
export const exportStorage = async function (
  props = {
    id_application: undefined,
    delete_existing_export: undefined,
    app_deletion: false,
  },
  fns = {
    user_get: user_builder.get,
    environment_get: environment_builder.get,
    application_get: application_service.get,
    get_application_export: storage_builder.getNonErrorApplicationStorage,
    storage_create: storage_builder.create,
    exec_smash_export: exec_smash_export,
    service_delete_storage: deleteStorage,
  }
) {
  const expected_props = {
    id_application: undefined,
    delete_existing_export: undefined,
  };
  let previous_export_deleted = false;

  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_application))
    throw new ParameterMisformed(
      'The props.id_application parameter is misformed.'
    );
  if (!parametres.check_boolean(props.delete_existing_export))
    throw new ParameterMisformed(
      'The props.delete_existing_export parameter is not a boolean.'
    );
  if (!parametres.check_boolean(props.app_deletion))
    throw new ParameterMisformed(
      'The props.app_deletion parameter is not a boolean.'
    );

  const application = await fns.application_get({
    id_application: props.id_application,
  });

  const user = await fns.user_get({ id_user: application.id_user });

  const application_shutdown_states = ['Off', 'EndedSession', 'DeletedLaunch'];
  if (!application_shutdown_states.includes(application.state_application)) {
    throw new StorageError('The application must be shutdown first.');
  }

  const applicationStorage = await fns.get_application_export({
    id_application: props.id_application,
  });
  const existing_states = ['Launched', 'Exporting'];
  if (applicationStorage.id_export && !props.delete_existing_export)
    throw new StorageAlreadyExists(
      'Storage already exists for this application.'
    );
  else if (
    applicationStorage.status === 'Available' &&
    props.delete_existing_export
  ) {
    await fns.service_delete_storage({
      id_application: props.id_application,
      id_export: applicationStorage.id_export,
    });
    previous_export_deleted = true;
  } else if (
    existing_states.includes(applicationStorage.status) &&
    props.delete_existing_export
  ) {
    throw new StorageAlreadyExists(
      'An Export is already in progress. Current status: ' +
        applicationStorage.status
    );
  }

  const environment_infos = await fns.environment_get({
    id_environment: application.id_environment,
  });

  // Retrieve the interface that isn't preposed with "ssh-" to check if storage is enabled
  const selectedInterface = environment_infos.interfaces.find(
    (interfaceItem) => !interfaceItem.label.startsWith('ssh-')
  );
  if (
    !selectedInterface.envs.some(
      (env) => env.key === 'HSTORAGE' && env.value === 'true'
    )
  )
    throw new StorageError('Storage is not enabled for this environment.');

  // Create storage export in database
  const promises = [
    fns
      .storage_create({
        id_application: props.id_application,
        availability_days: 1,
      })
      .then((application_export) => {
        fns
          .exec_smash_export({
            hash: application.hash,
            upload_id: application_export.id_export.toString(),
            label: selectedInterface?.label?.toLowerCase(),
            app_deletion: props.app_deletion,
            folder_path: `/home/${application.username}/`,
            storage_carrier_image: CONFIG.smash_storage_carrier_image,
            storage_carrier_image_tag: CONFIG.smash_storage_carrier_image_tag,
            smash_api_key: CONFIG.smash_storage_carrier_api_key,
            smash_region: CONFIG.smash_storage_carrier_region,
            smash_teamid: CONFIG.smash_storage_carrier_teamid,
            web_title: application.custom_label,
            upload_description: `${application.custom_label} Odin environment export from ${moment().format('YYYY-MM-DD HH:mm:ss')} (${moment.tz(moment.tz.guess()).format('z')})`,
            export_language: 'fr',
            availability: '30',
            sender_name: CONFIG.storage_carrier_sender_name,
            sender_email: CONFIG.storage_carrier_sender_email,
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
 * @param {*} props {id_user, id_export}
 * @param {*} fns overwriting functions for tests
 * @returns {}
 */

export const deleteStorage = async function (
  props = {
    id_application: undefined,
    id_export: undefined,
  },
  fns = {
    export_get: storage_builder.get,
    application_get: application_builder.get,
    exec_smash_deletion: exec_transfer_deletion,
    storage_revokation: storage_builder.deleteExport,
    storage_error: storage_builder.setError,
  }
) {
  const expected_props = {
    id_application: undefined,
    id_export: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_id(props.id_export))
    throw new ParameterMisformed('The props.id_export parameter is misformed.');
  if (!parametres.check_id(props.id_application))
    throw new ParameterMisformed(
      'The props.id_application parameter is misformed.'
    );
  const application_export = await fns.export_get({
    id_export: props.id_export,
  });

  const application = await fns.application_get({
    id_application: application_export.id_application,
  });

  if (props.id_application.toString() !== application.id_application.toString())
    throw new ParameterMisformed(
      'The props.id_application parameter does not match the export id.'
    );

  const promises = [
    fns
      .exec_smash_deletion({
        transfer_id: application_export.id_provider,
      })
      .then((response) => {
        if (response.transfer && response.transfer.status === 'Deleting') {
          return fns.storage_revokation({
            id_export: props.id_export,
          });
        } else if (
          response.code === 404 ||
          response.code === 403 ||
          response.code === 500
        ) {
          fns.storage_error({
            id_export: props.id_export,
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

  return await Promise.all(promises).then((r) => {
    return r[0];
  });
};
