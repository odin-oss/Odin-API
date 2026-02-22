import { Kafka, Partitioners } from 'kafkajs';
import CONFIG from '../config/config.js';
import z from 'zod';
import Guard from '../utils/guard.util.js';
import logs from '../middlewares/winston.js';
import moment from 'moment-timezone';
import { Application } from '../objects/Application.js';
import {
  list,
  update_application_export_state,
  update_state,
} from '../builders/applications.builder.js';
import {
  get_deployments,
  get_pods,
  get_replicasets,
} from '../objects/kubernetes/deployment.js';
import { get_services } from '../objects/kubernetes/service.js';
import { get_pvc } from '../objects/kubernetes/pvc.js';
import { parsingK8SObjects } from '../utils/parsing.util.js';

const topics = ['odin-oss-apps-state', 'odin-oss-upload-logs'];
const kafka = new Kafka({
  clientId: 'odin-oss',
  brokers: [CONFIG.KAFKA_BROKER],
});
const consumer = kafka.consumer({
  groupId: 'odin-oss-consumer',
  sessionTimeout: 10000,
});
const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});
const admin = kafka.admin();
let consumerIsConnected = false;
let producerIsConnected = false;
consumer.on('consumer.crash', async () => {
  await graceful_shutdown();
});
consumer.on('consumer.disconnect', async () => {
  await launch_states_consumption();
});

/**
 * Function that will reset the consumerIsConnected variable symbolizing if the kafka broker is connected or not.
 * @param {Boolean} state new state to put.
 */
export const changeConsumerIsConnected = (props) => {
  const schema = z.object({
    state: z.boolean().default(false),
  });
  const data = Guard.validateProps(schema, props);
  consumerIsConnected = data.state;
};
/**
 * Function that will reset the producerIsConnected variable symbolizing if the kafka broker is connected or not.
 * @param {Boolean} state new state to put.
 */
export const changeProducerIsConnected = (props) => {
  const schema = z.object({
    state: z.boolean().default(false),
  });
  const data = Guard.validateProps(schema, props);
  producerIsConnected = data.state;
};

/**
 * Graceful disconnection from the kafka.
 * @param {Function} fns overwriting functions for tests.
 */
export const shutdown = async (
  fns = {
    producer_disconnect: producer.disconnect,
    consumer_disconnect: consumer.disconnect,
  }
) => {
  if (producerIsConnected && CONFIG.KAFKA_ACTIVATED) {
    await fns.producer_disconnect();
    logs.info(
      '[SYSTEM][100] / : Kafka producer has been gracefully disconnected.'
    );
  }
  if (consumerIsConnected && CONFIG.KAFKA_ACTIVATED) {
    await fns.consumer_disconnect();
    logs.info(
      '[SYSTEM][100] / : Kafka consumer has been gracefully disconnected.'
    );
  }
};

/**
 * Function that will read all states as they are published by producer.
 * @param {Function} fns overwriting functions for tests.
 */
export const startKafkaConsumption = async (
  fns = {
    connect: consumer.connect,
    subscribe: consumer.subscribe,
    run: consumer.run,
    setInterval,
  }
) => {
  const dump = new Map();
  fns.setInterval(() => {
    for (const [hash, { timestamp }] of dump) {
      if (
        moment(timestamp).tz(CONFIG.APP_TZ) <
        moment.tz(CONFIG.APP_TZ).subtract(5, 'minute')
      ) {
        dump.delete(hash); // Remove old entry
        logs.info(
          `[SYSTEM][100] / : Removed state for application ${hash} due to inactivity.`
        );
      }
    }
  }, 60 * 1000);

  const run = async () => {
    try {
      if (!consumerIsConnected && CONFIG.KAFKA_ACTIVATED) {
        await fns.connect();
        changeConsumerIsConnected({ state: true });
        logs.info('[SYSTEM][100] / : Connected to the Kafka Broker.');
        await fns.subscribe({ topics: topics, fromBeginning: false });
        logs.info(
          '[SYSTEM][100] / : Consumer subscribed to topics: ' +
            topics.join(', ')
        );
        await fns.run({
          eachMessage: async ({ topic, partition, message }) => {
            try {
              if (topic === 'odin-oss-apps-state')
                applicationStateConsumption({ message, dump });
              else if (topic === 'upload-logs')
                applicationExportStateConsumption({ message });
            } catch (err) {
              logs.warn(`[${err.name}] ${err.message}`);
            }
          },
        });
      }
    } catch (err) {
      logs.debug(err);
      await shutdown();
      throw err;
    }
  };

  await run();
};

/**
 * Consuming result in a kafka message containing the Application state.
 * @param {Map} dump the live dump to filter the result.
 * @param {String} message actual message received in the Kafka topic.
 */
const applicationStateConsumption = async (props) => {
  try {
    const schema = z.object({
      dump: z.instanceof(Map),
      message: z.preprocess(
        (input) => {
          try {
            return JSON.parse(input.value.toString());
          } catch {
            return null;
          }
        },
        z.object({
          value: z.string().min(1),
          hash: z.string(),
          state: z.string(),
        })
      ),
    });
    const data = Guard.validateProps(schema, props);
    const entry = data.dump.get(data.message.hash);
    if (!entry || entry.state !== data.message.state) {
      data.dump.set(data.message.hash, {
        state: data.message.state,
        timestamp: moment.tz(CONFIG.APP_TZ),
      });
      state_updater({
        state_application: data.message.state,
        hash: data.message.hash,
      });
    }
  } catch (err) {
    logs.debug(err);
    logs.error(
      `[SYSTEM][100] / : Failed to process Kafka log : ${err.message}.`
    );
  }
};

/**
 * Consuming result in a kafka message containing the Application storage export state.
 * @param {String} message actual message received in the Kafka topic.
 */
const applicationExportStateConsumption = async (props) => {
  try {
    const schema = z.object({
      message: z.preprocess(
        (input) => {
          try {
            return JSON.parse(input.value.toString());
          } catch {
            return null;
          }
        },
        z.object({
          value: z.string().min(1),
          hash: z.string(),
          state: z.string(),
        })
      ),
    });
    const validatedData = Guard.validateProps(schema, props);
    const { exportId, hash, state, appDeletion, data } = validatedData.message;

    if (['progress', 'finished', 'failed'].includes(state)) {
      storage_updater({
        id_export: exportId,
        hash: hash,
        state: state,
        app_deletion: appDeletion,
        id_provider: data.providerId,
        download_link: data.transferUrl,
      });
    } else if (!['connected', 'list', 'start'].includes(state)) {
      logs.warn(`Unknown state: ${state} for application export: ${exportId}`);
    }
  } catch (err) {
    logs.debug(err);
    logs.error(
      `[SYSTEM][100] / : Failed to process Kafka log : ${err.message}.`
    );
  }
};

/**
 * Private function that is used to update the state of application.
 * @param {String} state_application actual state of the application, to set in the database.
 * @param {String} hash unique hash to identify the application.
 * @param {Function} fns overwriting functions for tests
 * @returns {Application}
 */
const state_updater = async (
  props,
  fns = {
    update_state,
  }
) => {
  const schema = z.object({
    state_application: z.enum([
      'Ready',
      'Off',
      'Getting ready',
      'Deleted',
      'Scheduled',
      'Error',
    ]),
  });
  const data = Guard.validateProps(schema, props);
  return await fns.update_state(data);
};

/**
 * Private function that is used to update the storage state of the application.
 * @param {Number} id_export id of the export we're looking to.
 * @param {String} hash unique hash to identify the application.
 * @param {String} state new state of the export of application storage.
 * @param {Boolean} app_deletion should the application be deleted.
 * @param {Number} id_provider id of the provider that is doing the export.
 * @param {String} download_link final link of the download.
 * @param {Function} fns overwriting functions for tests
 * @returns {Application}
 */
const storage_updater = async (
  props,
  fns = {
    update_application_export_state,
  }
) => {
  const schema = z.object({
    id_export: z.coerce.number().int().positive(),
    id_provider: z.coerce.number().int().positive().default(null),
    hash: z.string().min(6).max(6),
    state: z.enum(['progress', 'finished', 'failed']),
    app_deletion: z
      .preprocess((val) => String(val).toLocaleLowerCase(), z.string())
      .transform((val) => val === 'true')
      .default(false),
    download_link: z.string().default(null),
  });
  const data = Guard.validateProps(schema, props);
  const STATE_MAP = {
    progress: 'Exporting',
    finished: 'Available',
    failed: 'Error',
  };
  return await fns.update_application_export_state({
    ...data,
    state: STATE_MAP[data.state],
  });
};

/**
 * Function that will publish all the states after fetching them in the Kafka topic.
 * @param {Function} fns overwriting functions for tests
 */
export const publish = async (
  fns = {
    connect: producer.connect,
    send: producer.send,
    list,
    get_k8s_object: get_all_kubernetes_object,
  }
) => {
  const run = async () => {
    try {
      // Connect the producer
      if (!producerIsConnected && CONFIG.KAFKA_ACTIVATED) {
        await fns.connect();
        changeProducerIsConnected({ state: true });
        logs.info(
          '[SYSTEM][100] / : Kafka producer connected to the Kafka Broker.'
        );
      }

      const hashes = (await fns.list()).map((app) => app.hash);
      const content = await fns.get_k8s_object({ hashes });

      if (CONFIG.KAFKA_ACTIVATED) {
        for (const element of content) {
          await fns.send({
            topic: topics[0],
            messages: [
              {
                key: `${element.topic}${moment
                  .tz(CONFIG.APP_TZ)
                  .format('YYYYMMDDHHmmss')}`,
                value: element.stdout,
              },
            ],
          });
        }
      }

      logs.info(
        '[SYSTEM][100] / : The states of applications have been published.'
      );
    } catch (error) {
      logs.error('[SYSTEM][100] / : Error producing message :', error.name);
      logs.debug(error);
      if (error.name === 'KafkaJSConnectionError') {
        shutdown();
      }
      throw error;
    }
  };

  await run();
};

/**
 * This function is creating the Kafka clusters on creation (start).
 */
export const createKafkaTopics = async () => {
  await admin.connect();
  logs.info(
    `[SYSTEM][100] / : Kafka Admin connected for topics creation : ${JSON.stringify(topics)} `
  );
  for (let topic of topics) {
    const success = await admin.createTopics({
      validateOnly: false,
      waitForLeaders: true,
      timeout: 5000,
      topics: [
        {
          topic: topic,
          numPartitions: 3, // Increase for better parallelism
          replicationFactor: 1, // Set to 1 for local dev, 3 for production
          configEntries: [
            { name: 'cleanup.policy', value: 'delete' },
            { name: 'retention.ms', value: '604800000' }, // 1 days
          ],
        },
      ],
    });
    if (success) {
      logs.info(
        `[SYSTEM][100] / : Kafka Admin said that topic ${topic} has been created.`
      );
    } else {
      logs.debug(
        `[SYSTEM][100] / : Kafka Admin said that topic ${topic} already exists. `
      );
    }
  }
  await admin.disconnect();
  logs.info(
    `[SYSTEM][100] / : Kafka Admin disconnected because topics creation is over.`
  );
};

/**
 * Function that will get all the k8s objects linked to the hashes in the array in argument.
 * @param {Array<String>} hashes list of hashes to check on the cluster.
 * @param {Function} fns functions to overwrite for tests.
 * @returns {JSON}
 */
export const get_all_kubernetes_object = async (
  props,
  fns = {
    get_replicasets,
    get_pvc,
    get_deployments,
    get_pods,
    get_services,
    parsingK8SObjects,
  }
) => {
  const schema = z.object({
    hashes: z.array(z.string().min(6).max(6)).default([]),
  });
  const data = Guard.validateProps(schema, props);
  if (data.hashes.length === 0) return [];

  let promises = [];
  for (const hash of data.hashes) {
    promises = [
      ...promises,
      fns.get_replicasets({ hash }),
      fns.get_pvc({ hash }),
      fns.get_deployments({ hash }),
      fns.get_pods({ hash }),
      fns.get_services({ hash }),
    ];
  }
  return await Promise.all(promises).then((r) => {
    const result = [];
    for (let i = 0; i < data.hashes.length; i++) {
      const items = [
        ...r[i * 5].items,
        ...r[i * 5 + 1].items,
        ...r[i * 5 + 2].items,
        ...r[i * 5 + 3].items,
        ...r[i * 5 + 4].items,
      ];
      result.push({
        topic: `${data.hashes[i]}`,
        stdout: fns.parsingK8SObjects({
          items: items,
          hash: data.hashes[i],
        }),
      });
    }

    return result;
  });
};
