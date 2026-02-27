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
} from '../utils/errors.util.js';
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
      CONFIG.DB_NAME,
      CONFIG.DB_USER,
      CONFIG.DB_PASSWORD,
      {
        host: CONFIG.DB_HOST,
        port: CONFIG.DB_PORT,
        dialect: CONFIG.DB_DIALECT,
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
        logging: CONFIG.ENV === 'local',
        timezone: CONFIG.APP_TZ,
      }
    );
    return this.sequelize;
  }

  async executeInitScript(filePath) {
    const sequelize = this.getSequelize();
    const sql = fs.readFileSync(filePath, 'utf8');

    // Split by semicolon if you have multiple statements,
    // or just run the whole blob if your dialect supports it.
    await sequelize.query(sql);
    logger.info(
      `[SYSTEM][200] / : Initial SQL script executed successfully (${filePath}).`
    );
  }

  async initModels() {
    const sequelize = this.getSequelize();

    if (process.env.ENV !== 'test') {
      const sqlModel = resolve(__dirname, '../../sql/model.sql');
      const sqlData = resolve(__dirname, '../../sql/data.sql');
      if (fs.existsSync(sqlModel) && fs.existsSync(sqlData)) {
        await this.executeInitScript(sqlModel);
        await this.executeInitScript(sqlData);
      }

      const auto = new SequelizeAuto(
        CONFIG.DB_NAME,
        CONFIG.DB_USER,
        CONFIG.DB_PASSWORD,
        {
          host: CONFIG.DB_HOST,
          dialect: CONFIG.DB_DIALECT,
          port: CONFIG.DB_PORT,
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
    }
    const mod = await import('../models/init-models.js');
    const initModels = mod.default || mod.initModels; // ✅ Gère default/named

    this.models = initModels(sequelize, Sequelize.DataTypes);
    if (process.env.ENV !== 'test') {
      await sequelize.authenticate();
    }
    return this.db;
  }

  sequelizeErrorManagement(error) {
    if (error instanceof DBObjectNotFound) throw error;
    if (error instanceof Sequelize.ConnectionRefusedError)
      throw new DBConnexionRefused('DB connection refused.');
    if (error instanceof Sequelize.ForeignKeyConstraintError)
      throw new DBForeignKeyConstraintError('Foreign key still existing.');
    if (error.name === 'SequelizeUniqueConstraintError')
      throw new DBForeignKeyConstraintError(
        'Unique constraint encountered. Check the fields (label,etc..) you gave.'
      );
    throw error;
  }
}

const dbManager = new DBManager();
export default dbManager;
export const getDB = () => dbManager.initModels();
