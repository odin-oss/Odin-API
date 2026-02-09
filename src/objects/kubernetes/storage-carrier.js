import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../../utils/errors.service.js';
import Guard from '../../utils/guard.service.js';

/**
 * Function that will launch a Smash export for a given environment.
 * @param {*} param0
 * @returns
 */
export const smashExport = async function (
  props = {
    hash: undefined,
    upload_id: undefined,
    label: undefined,
    app_deletion: undefined,
    folder_path: undefined,
    storage_carrier_image: undefined,
    storage_carrier_image_tag: undefined,
    smash_api_key: undefined,
    smash_region: undefined,
    smash_teamid: undefined,
    web_title: undefined,
    upload_description: undefined,
    export_language: undefined,
    availability: undefined,
    sender_name: undefined,
    sender_email: undefined,
    receiver_email: undefined,
  },
  fetch = kapi.fetch
) {
  // Checking all props
  const expected_props = {
    hash: undefined,
    upload_id: undefined,
    label: undefined,
    app_deletion: undefined,
    folder_path: undefined,
    storage_carrier_image: undefined,
    storage_carrier_image_tag: undefined,
    smash_api_key: undefined,
    smash_region: undefined,
    smash_teamid: undefined,
    web_title: undefined,
    upload_description: undefined,
    export_language: undefined,
    availability: undefined,
    sender_name: undefined,
    sender_email: undefined,
    receiver_email: undefined,
  };
  if (Guard.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${Guard.check_props(expected_props, props)}) are missing.`
    );
  if (!Guard.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');

  // kapi request
  const body = {
    metadata: {
      name: `storage-carrier-${props.hash}-${props.upload_id}`,
      namespace: `n${props.hash}`,
      labels: {
        hash: `${props.hash}`,
        app: 'cirrus-storage-carrier',
      },
    },
    spec: {
      backoffLimit: 2,
      ttlSecondsAfterFinished: 60,
      template: {
        spec: {
          // serviceAccountName: 'sa-cirrus-storage-carrier',
          volumes: [
            {
              name: `${props.label}${props.hash}-pvc`,
              persistentVolumeClaim: {
                claimName: `${props.label}${props.hash}-pvc`,
              },
            },
          ],
          containers: [
            {
              name: `storage-carrier-${props.hash}-${props.upload_id}`,
              image: `${props.storage_carrier_image}:${props.storage_carrier_image_tag}`,
              env: [
                { name: 'ENV_HASH', value: props.hash },
                { name: 'UPLOAD_ID', value: props.upload_id },
                { name: 'APP_DELETION', value: props.app_deletion.toString() },
                { name: 'FOLDER_PATH', value: props.folder_path },
                {
                  name: 'SMASH_API_KEY',
                  value: props.smash_api_key,
                },
                { name: 'SMASH_REGION', value: props.smash_region },
                { name: 'ENV_NAME', value: props.web_title },
                {
                  name: 'SMASH_UPLOAD_DESCRIPTION',
                  value: props.upload_description,
                },
                {
                  name: 'SMASH_UPLOAD_TEAMID',
                  value: props.smash_teamid,
                },
                { name: 'SMASH_UPLOAD_LANGUAGE', value: props.export_language },
                {
                  name: 'SMASH_UPLOAD_AVAILABILITY',
                  value: props.availability,
                },
                {
                  name: 'SMASH_UPLOAD_SENDER_NAME',
                  value: props.sender_name,
                },
                {
                  name: 'SMASH_UPLOAD_SENDER_EMAIL',
                  value: props.sender_email,
                },
                {
                  name: 'SMASH_UPLOAD_RECEIVER_EMAIL',
                  value: props.receiver_email,
                },
                { name: 'KAFKA_BROKERS', value: CONFIG.KAFKA_BROKER },
                { name: 'KAFKA_TOPIC', value: CONFIG.KAFKA_TOPIC },
                { name: 'KAFKA_CLIENT_ID', value: 'storage-carrier' },
              ],
              ressources: {
                limits: { cpu: '2', memory: '1Gi' },
                requests: { cpu: '100m', memory: '100Mi' },
              },
              volumeMounts: [
                {
                  name: `${props.label}${props.hash}-pvc`,
                  mountPath: props.folder_path,
                },
              ],
            },
          ],
          restartPolicy: 'Never',
          imagePullSecrets: [{ name: 'registryhub' }],
        },
      },
    },
  };
  const url = `${CONFIG.KUBERNETES_URL}/apis/batch/v1/namespaces/n${props.hash}/jobs`;
  return await Promise.resolve(fetch({ url, method: 'POST', body })).then(
    (res) => {
      console.log(res);
      return {
        result: res,
        type: 'Job',
        name: `storage-carrier-${props.hash}-${props.upload_id}`,
      };
    }
  );
};
