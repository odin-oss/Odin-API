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
import pkg from '../package.json' with { type: 'json' };
import { Sequelize } from 'sequelize';

// TEST CONNECT TO PSQL DB
logger.info(`[SYSTEM][100] / : Trying to connect to PSQL.`);
await dbManager
  .initModels()
  .then(() => logger.info(`[SYSTEM][200] / : 1/2. Postgres DB connected.`))
  .catch((error) => {
    if (error instanceof Sequelize.ConnectionRefusedError)
      logger.error(
        `[SYSTEM][500] / : 1/2. Postgres Error: The server refused the connection.`
      );
    else if (error instanceof Sequelize.AccessDeniedError)
      logger.error(
        `[SYSTEM][500] / : 1/2. Postgres Error: The authentication failed.`
      );
    else if (error instanceof Sequelize.HostNotFoundError)
      logger.error(
        `[SYSTEM][500] / : 1/2. Postgres Error: The server could not find the PSQL host.`
      );
    else
      logger.error(
        `[SYSTEM][500] / : 1/2. Postgres Error: The server encountered an error : ${error}`
      );
    logger.debug(error);
    process.exit(0);
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
