import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    limit: '10mb',
    extended: true,
  })
);
app.use(
  cors({
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
    exposedHeaders: ['authorization'],
  })
);

import logger from './middlewares/winston.js';
import CONFIG from './config/config.js';
import routerModule from './modules/router.module.js';
import dbManager from './config/db.config.js';
import { fetch as kong } from './modules/kong-api.module.js';
import { fetch as kapi } from './modules/kapi.module.js';
import pkg from '../package.json' with { type: 'json' };
import cron from 'node-cron';
import { Sequelize } from 'sequelize';
import {
  createKafkaTopics,
  startKafkaConsumption,
  startKafkaPublication,
} from './modules/kafka.module.js';
import {
  launch_delete_apps,
  launch_scheduled_applications,
  launch_stop_applications,
  launch_stop_sessions,
} from './modules/cron.module.js';
import { create } from './objects/kubernetes/namespace.js';

// TEST CONNECT TO PSQL DB
logger.info(`[SYSTEM][100] / : Trying to connect to PSQL.`);
await dbManager
  .initModels()
  .then(() => logger.info(`[SYSTEM][200] / : 1/5. Postgres DB connected.`))
  .catch((error) => {
    if (error instanceof Sequelize.ConnectionRefusedError)
      logger.error(
        `[SYSTEM][500] / : 1/5. Postgres Error: The server refused the connection.`
      );
    else if (error instanceof Sequelize.AccessDeniedError)
      logger.error(
        `[SYSTEM][500] / : 1/5. Postgres Error: The authentication failed.`
      );
    else if (error instanceof Sequelize.HostNotFoundError)
      logger.error(
        `[SYSTEM][500] / : 1/5. Postgres Error: The server could not find the PSQL host.`
      );
    else
      logger.error(
        `[SYSTEM][500] / : 1/5. Postgres Error: The server encountered an error : ${error}`
      );
    logger.debug(error);
    process.exit(0);
  });
// TEST CONNECT TO KONG
logger.info(`[SYSTEM][100] / : Trying to connect to KONG (APPS-INGRESS).`);
if (CONFIG.APPS_INGRESS_ACTIVATED)
  await kong({ url: '/status', method: 'get' })
    .then(() => logger.info(`[SYSTEM][200] / : 2/5. KONG reachable.`))
    .catch((error) => {
      logger.error(
        `[SYSTEM][500] / : 2/5. KONG Error: The server encountered an error : ${error}`
      );
      logger.debug(error);
      process.exit(0);
    });
else logger.warn(`[SYSTEM][200] / : 2/5. KONG disabled.`);

// TEST CONNECT TO Kubernetes API
logger.info(`[SYSTEM][100] / : Trying to connect to Kubernetes API.`);
if (CONFIG.KUBERNETES_ACTIVATED) {
  await kapi({ url: '/healthz', method: 'get' })
    .then(() => logger.info(`[SYSTEM][200] / : 3/5. Kubernetes API reachable.`))
    .catch((error) => {
      logger.error(
        `[SYSTEM][500] / : 3/5. Kubernetes API Error: The server encountered an error : ${error}`
      );
      logger.debug(error);
      process.exit(0);
    });
  await create({ hash: 'odin' })
    .then(() =>
      logger.info(
        `[SYSTEM][200] / : 3/5. Odin has created the 'odin' namespace on the cluster.`
      )
    )
    .catch((error) => {
      logger.error(
        `[SYSTEM][500] / : 3/5. Kubernetes API Error during creation of 'odin' namespace : ${error}`
      );
      logger.debug(error);
      process.exit(0);
    });
} else logger.warn(`[SYSTEM][200] / : 3/5. Kubernetes API disabled.`);

// TEST CONNECT TO KAFKA
logger.info(`[SYSTEM][100] / : Trying to connect to Kafka.`);
if (CONFIG.KAFKA_ACTIVATED) {
  await createKafkaTopics()
    .then(() => logger.info(`[SYSTEM][200] / : 4/5. Kafka topics created.`))
    .catch((error) => {
      logger.error(
        `[SYSTEM][500] / : 4/5. Kafka error during topic creation: The server encountered an error : ${error}`
      );
      logger.debug(error);
      process.exit(0);
    });
  await startKafkaConsumption()
    .then(() => logger.info(`[SYSTEM][200] / : 4/5. Kafka consumer connected.`))
    .catch((error) => {
      logger.error(
        `[SYSTEM][500] / : 4/5. Kafka consumer Error: The server encountered an error : ${error}`
      );
      logger.debug(error);
      process.exit(0);
    });
  logger.info(`[SYSTEM][CRON] / : Starting publication of states in kafka.`);
  cron.schedule('*/10 * * * * *', () => {
    logger.debug('[CRON][200] Checking applications scheduled to be started.');
    startKafkaPublication()
      .then(() =>
        logger.debug(`[SYSTEM][200] / : States published in kafka broker.`)
      )
      .catch((error) => {
        logger.error(
          `[SYSTEM][500] / : 4/5. Kafka producer Error: The server encountered an error : ${error}`
        );
        logger.debug(error);
        process.exit(0);
      });
  });
} else logger.warn(`[SYSTEM][200] / : 4/5. Kafka disabled.`);

// ADVICES AND WARNINGS
if (CONFIG.KUBERNETES_ACTIVATED && !CONFIG.KUBERNETES_ISTIO_ACTIVATED)
  logger.warn(
    `[SYSTEM][SECURITY] / : 4/5. CAUTION ! You should enable Istio on your cluster.`
  );

// LAUNCHING CRONS
logger.info(
  `[SYSTEM][CRON] / : Starting detection of applications scheduled to be started.`
);
cron.schedule('*/2 * * * * *', () => {
  logger.debug('[CRON][200] Checking applications scheduled to be started.');
  launch_scheduled_applications().then(
    (response) =>
      response !== 0 &&
      logger.info('[CRON][200] ' + response + ' applications started.')
  );
});
logger.info(`[SYSTEM][CRON] / : Starting detection of applications to stop.`);
cron.schedule('*/30 * * * * *', () => {
  logger.debug('[CRON][200] Checking for applications to stop.');
  launch_stop_applications().then(
    (response) =>
      response !== 0 &&
      logger.info('[CRON][200] ' + response + ' applications stopped.')
  );
});
logger.info(`[SYSTEM][CRON] / : Starting detection of sessions to stop.`);
cron.schedule('*/30 * * * * *', () => {
  logger.debug('[CRON][200] Checking for sessions to stop.');
  launch_stop_sessions().then(
    (response) =>
      response !== 0 &&
      logger.info('[CRON][200] ' + response + ' sessions stopped.')
  );
});
logger.info(`[SYSTEM][CRON] / : Starting detection of applications to delete.`);
cron.schedule('*/30 * * * * *', () => {
  logger.debug('[CRON][200] Checking for applications to delete.');
  launch_delete_apps().then(
    (response) =>
      response !== 0 &&
      logger.info('[CRON][200] ' + response + ' application deleted.')
  );
});

const optionsJSdoc = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Odin OSS API',
      version: pkg.version || '1.0.0',
      description: 'API backend Node.js/Express pour green IT cloud',
      contact: { name: 'Caelus Team', email: 'benlef99@getcaelus.cloud' },
    },
    host: `${CONFIG.SWAGGER_URL}`, // Host (optional)
    basePath: '/', // Base path (optional)
    schemes: [CONFIG.SWAGGER_METHOD],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        scheme: 'bearer',
        name: 'Authorization',
        in: 'header',
        description: `Don't forget to add 'Bearer ' for example : Bearer xxxx.`,
      },
    },
  },
  apis: ['./src/config/db.config.js', './src/routes/**/*.route.js'],
};

const swaggerSpec = swaggerJsdoc(optionsJSdoc);
app.use(
  '/doc',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
  })
);
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.locals.logger = logger;
app.locals.config = CONFIG;
app.set('config', CONFIG);
routerModule(app);
export default app;
