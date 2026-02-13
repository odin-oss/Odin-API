import z from 'zod';
import CONFIG from '../../config/config.js';
import * as kapi from '../../modules/kapi.module.js';
import Guard from '../../utils/guard.util.js';

/**
 * Function that will launch a Smash export for a given environment.
 * @param {String} hash unique has the application.
 * @param {String} upload_id unique Smash id.
 * @param {String} label label of the application.
 * @param {Boolean} app_deletion unique has the application.
 * @param {String} folder_path path where to find the data.
 * @param {String} storage_carrier_image container image of the storage carrier.
 * @param {String} storage_carrier_image_tag container image's tag of the storage carrier.
 * @param {String} smash_api_key smash api key for Smash api auth.
 * @param {String} smash_region smash api region for Smash api auth.
 * @param {String} smash_teamid smash api teamid for Smash api auth.
 * @param {String} web_title web_title to display on UI.
 * @param {String} upload_description description to display on Smash website.
 * @param {String} export_language language of the export.
 * @param {String} availability days of availability of the final link.
 * @param {String} sender_name name of the sender - your name / company name for displaying on user mail.
 * @param {String} sender_email your mail / company mail for following link.
 * @param {String} receiver_email mail of the final user that will be used to receive the link.
 * @param {Function} fetch functions to overwrite for unit testing.
 * @returns {JSON}
 */
export const smashExport = async function (props, fetch = kapi.fetch) {
  const schema = z.object({
    hash: z.string().min(8).max(8),
    upload_id: z.string(),
    label: z.string(),
    app_deletion: z.boolean().default(false),
    folder_path: z.string(),
    storage_carrier_image: z.string(),
    storage_carrier_image_tag: z.string(),
    smash_api_key: z.string(),
    smash_region: z.string(),
    smash_teamid: z.string(),
    web_title: z.string(),
    upload_description: z.string(),
    export_language: z.string(),
    availability: z.string(),
    sender_name: z.string(),
    sender_email: z.email(),
    receiver_email: z.email(),
  });
  const data = Guard.validateProps(schema, props);

  // kapi request
  const body = {
    metadata: {
      name: `storage-carrier-${data.hash}-${data.upload_id}`,
      namespace: `n${data.hash}`,
      labels: {
        hash: `${data.hash}`,
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
              name: `${data.label}${data.hash}-pvc`,
              persistentVolumeClaim: {
                claimName: `${data.label}${data.hash}-pvc`,
              },
            },
          ],
          containers: [
            {
              name: `storage-carrier-${data.hash}-${data.upload_id}`,
              image: `${data.storage_carrier_image}:${data.storage_carrier_image_tag}`,
              env: [
                { name: 'ENV_HASH', value: data.hash },
                { name: 'UPLOAD_ID', value: data.upload_id },
                { name: 'APP_DELETION', value: data.app_deletion.toString() },
                { name: 'FOLDER_PATH', value: data.folder_path },
                {
                  name: 'SMASH_API_KEY',
                  value: data.smash_api_key,
                },
                { name: 'SMASH_REGION', value: data.smash_region },
                { name: 'ENV_NAME', value: data.web_title },
                {
                  name: 'SMASH_UPLOAD_DESCRIPTION',
                  value: data.upload_description,
                },
                {
                  name: 'SMASH_UPLOAD_TEAMID',
                  value: data.smash_teamid,
                },
                { name: 'SMASH_UPLOAD_LANGUAGE', value: data.export_language },
                {
                  name: 'SMASH_UPLOAD_AVAILABILITY',
                  value: data.availability,
                },
                {
                  name: 'SMASH_UPLOAD_SENDER_NAME',
                  value: data.sender_name,
                },
                {
                  name: 'SMASH_UPLOAD_SENDER_EMAIL',
                  value: data.sender_email,
                },
                {
                  name: 'SMASH_UPLOAD_RECEIVER_EMAIL',
                  value: data.receiver_email,
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
                  name: `${data.label}${data.hash}-pvc`,
                  mountPath: data.folder_path,
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
  const url = `/apis/batch/v1/namespaces/n${data.hash}/jobs`;
  return await fetch({ url, method: 'POST', body }).then((res) => ({
    result: res,
    type: 'Job',
    name: `storage-carrier-${data.hash}-${data.upload_id}`,
  }));
};
