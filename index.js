import express from 'express';
import cors from 'cors';
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
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
    exposedHeaders: ['authorization'],
  })
);

import logger from './src/config/winston.config.js';
import CONFIG from './src/config/config.js';
import { test_health } from './src/utils/health.service.js';
import db from './src/config/db.config.js';

import routerModule from './src/modules/router.module.js';
routerModule(app);

test_health().then((r) => {
  for (const element of r) {
    if (element.ms === 'ms-deployment') {
      if (element.state)
        logger.info(
          '[SYSTEM][200] / : 2/5. Connexion à MS-Deployment réussie.'
        );
      else
        logger.error(
          `[SYSTEM][500] / : 2/5. Impossible de se connecter à MS-Deployment ${CONFIG.k8s_host}:${CONFIG.k8s_port} : [${element.reason}]`
        );
    }
    if (element.ms === 'db.cirrus') {
      if (element.state)
        logger.info(
          '[SYSTEM][200] / : 3/5. Connexion à la bdd cirrus réussie.'
        );
      else
        logger.error(
          `[SYSTEM][${
            db.sequelizeErrorManagement(element.reason).status
          }] / : 3/5. [${CONFIG.db_host}:${CONFIG.db_port}] (${
            CONFIG.db_cirrus_name
          }) ${db.sequelizeErrorManagement(element.reason).result}`
        );
    }
    if (element.ms === 'db.caelus') {
      if (element.state)
        logger.info(
          '[SYSTEM][200] / : 5/5. Connexion à la bdd caelus réussie.'
        );
      else
        logger.error(
          `[SYSTEM][${
            db.sequelizeErrorManagement(element.reason).status
          }] / : 5/5. [${CONFIG.db_host}:${CONFIG.db_port}] (${
            CONFIG.db_caelus_name
          }) ${db.sequelizeErrorManagement(element.reason).result}`
        );
    }
  }
});
app.listen(CONFIG.port, () => {
  logger.info(
    "[SYSTEM][200] / : 1/5. L'API est lancé et reste en attente requêtes..."
  );
});

export default app;
