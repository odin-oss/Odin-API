import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { SequelizeAuto } from 'sequelize-auto';
import Sequelize from 'sequelize';
import CONFIG from './config.js';
import {
  DBConnexionRefused,
  DBForeignKeyConstraintError,
  DBObjectNotFound,
} from '../utils/errors.service.js';
import logger from '../middlewares/winston.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DBManager {
  constructor() {
    this.sequelize = null;
    this.models = null;
    this.db = {};
  }

  getSequelize() {
    if (this.sequelize) return this.sequelize;

    this.sequelize = new Sequelize(
      CONFIG.db_name,
      CONFIG.db_user,
      CONFIG.db_password,
      {
        host: CONFIG.db_host,
        port: CONFIG.db_port,
        dialect: CONFIG.db_dialect,
        pool: { max: 30, min: 0, idle: 30000, acquire: 200000 },
        define: {
          underscored: false,
          freezeTableName: true,
          timestamps: true,
          charset: 'utf8',
        },
        dialectOptions: {
          useUTC: false,
          dateStrings: true,
          typeCast: (field, next) => {
            if (field.type === 'DATETIME' || field.type === 'TIMESTAMP')
              return field.string();
            return next();
          },
        },
        logging: CONFIG.NODE_ENV === 'development',
        timezone: CONFIG.timezone,
      }
    );
    return this.sequelize;
  }

  async executeInitScript(filePath) {
    const sequelize = this.getSequelize();
    try {
      const sql = fs.readFileSync(filePath, 'utf8');

      // Split by semicolon if you have multiple statements,
      // or just run the whole blob if your dialect supports it.
      await sequelize.query(sql);
      logger.info(`[SYSTEM][200] / : Initial SQL script executed successfully (${filePath}).`);
    } catch (error) {
      logger.info(`[SYSTEM][200] / : Initial SQL script executed successfully (${filePath}).`);
      throw error;
    }
  }

  async initModels() {
    const sequelize = this.getSequelize();

    const sqlModel = resolve(__dirname, '../../sql/model.sql');
    const sqlData = resolve(__dirname, '../../sql/data.sql');
    if (fs.existsSync(sqlModel) && fs.existsSync(sqlData)) {
      await this.executeInitScript(sqlModel);
      await this.executeInitScript(sqlData);
    }

    const auto = new SequelizeAuto(
      CONFIG.db_name,
      CONFIG.db_user,
      CONFIG.db_password,
      {
        host: CONFIG.db_host,
        dialect: CONFIG.db_dialect,
        port: CONFIG.db_port,
        logging: false,
        caseModel: 'u',
        caseFile: 'u',
        caseProp: 'l',
        lang: 'esm',
        noAlias: true,
        directory: resolve(__dirname, '../models'),
      }
    );
    await auto.run();

    const mod = await import('../models/init-models.js');
    const initModels = mod.default || mod.initModels; // ✅ Gère default/named

    this.models = initModels(sequelize, Sequelize.DataTypes);
    await sequelize.authenticate();

    return this.db;
  }

  sequelizeErrorManagement(error) {
    if (error instanceof DBObjectNotFound) throw error;
    if (error instanceof Sequelize.ConnectionRefusedError)
      throw new DBConnexionRefused('Connexion DB refusée.');
    if (error instanceof Sequelize.ForeignKeyConstraintError)
      throw new DBForeignKeyConstraintError('Clé étrangère en conflit.');
    throw error;
  }
}

const dbManager = new DBManager();
export default dbManager;
export const getDB = () => dbManager.initModels();
