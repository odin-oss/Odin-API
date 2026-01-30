import path, { dirname } from 'path';
import { SequelizeAuto } from 'sequelize-auto';
import CONFIG from './config.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const init = async function () {
  const autoCirrus = new SequelizeAuto(
    CONFIG.db_cirrus_name,
    CONFIG.db_user,
    CONFIG.db_password,
    {
      logging: false,
      host: CONFIG.db_host,
      dialect: CONFIG.db_dialect,
      caseModel: 'u',
      caseFile: 'u',
      caseProp: 'l',
      lang: 'esm',
      noAlias: true,
      port: CONFIG.db_port,
      directory: path.resolve(__dirname, './models-cirrus'),
    }
  );
  const autoCaelus = new SequelizeAuto(
    CONFIG.db_caelus_name,
    CONFIG.db_user,
    CONFIG.db_password,
    {
      logging: false,
      host: CONFIG.db_host,
      caseModel: 'u',
      caseFile: 'u',
      caseProp: 'l',
      noAlias: true,
      dialect: CONFIG.db_dialect,
      lang: 'esm',
      port: CONFIG.db_port,
      directory: path.resolve(__dirname, './models-caelus'),
    }
  );
  const runAutoCaelus = new Promise((resolve, reject) => {
    autoCaelus.run().then((err) => {
      resolve(true);
    });
  });
  const runAutoCirrus = new Promise((resolve, reject) => {
    autoCirrus.run().then((err) => {
      resolve(true);
    });
  });
  return await Promise.all([runAutoCaelus, runAutoCirrus])
    .then((r) => {
      return r;
    })
    .catch((err) => {
      throw err;
    });
};

export default init;
