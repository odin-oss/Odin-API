import { Kafka, Partitioners } from 'kafkajs';
import CONFIG from '../config/config.js';
import z from 'zod';
import Guard from '../utils/guard.util.js';
import logs from '../middlewares/winston.js';
import moment from 'moment-timezone';
import { Application } from '../objects/Application.js';
import {
  update_application_export_state,
  update_state,
} from '../builders/applications.builder.js';
import { ParameterMisformed } from '../utils/errors.util.js';

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
  const topics = ['odin-oss-apps-state', 'odin-oss-upload-logs'];
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
      const id_provider =
        data.providerId !== undefined ? data.providerId : null;
      const download_link =
        data.transferUrl !== undefined ? data.transferUrl : null;

      storage_updater({
        id_export: exportId,
        hash: hash,
        state: state,
        app_deletion: appDeletion,
        id_provider: id_provider,
        download_link: download_link,
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
    id_provider: z.coerce.number().int().positive().optional(),
    hash: z.string().min(6).max(6),
    state: z.enum(['progress', 'finished', 'failed']),
    app_deletion: z
      .preprocess((val) => String(val).toLocaleLowerCase(), z.string())
      .transform((val) => val === 'true')
      .default(false),
    download_link: z.string().optional(),
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
