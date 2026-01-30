import Sequelize from 'sequelize';
import CONFIG from './config.js';
import initModelsCirrus from './models-cirrus/init-models.js';
import initModelsCaelus from './models-caelus/init-models.js';
import {
  DBConnexionRefused,
  DBForeignKeyConstraintError,
  DBObjectNotFound,
} from '../utils/errors.service.js';

let caelusInstance = null;
let cirrusInstance = null;
const getInstances = function () {
  if (!cirrusInstance) {
    cirrusInstance = new Sequelize(
      CONFIG.db_cirrus_name,
      CONFIG.db_user,
      CONFIG.db_password,
      {
        host: CONFIG.db_host,
        port: CONFIG.db_port,
        dialect: CONFIG.db_dialect,
        pool: {
          max: 30,
          min: 0,
          idle: 30000,
          acquire: 200000,
        },
        define: {
          underscored: false,
          freezeTableName: true, //use singular table name
          timestamps: true, // I do not want timestamp fields by default
          charset: 'utf8',
        },
        dialectOptions: {
          useUTC: false, //for reading from database
          dateStrings: true,
          typeCast: function (field, next) {
            // for reading from database
            if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
              return field.string();
            }
            return next();
          },
        },
        logging: false,
        timezone: CONFIG.timezone,
      }
    );
  }
  if (!caelusInstance) {
    caelusInstance = new Sequelize(
      CONFIG.db_caelus_name,
      CONFIG.db_user,
      CONFIG.db_password,
      {
        host: CONFIG.db_host,
        port: CONFIG.db_port,
        dialect: CONFIG.db_dialect,
        pool: {
          max: 30,
          min: 0,
          idle: 30000,
          acquire: 200000,
        },
        define: {
          underscored: false,
          freezeTableName: true, //use singular table name
          timestamps: true, // I do not want timestamp fields by default
          charset: 'utf8',
        },
        dialectOptions: {
          useUTC: false, //for reading from database
          dateStrings: true,
          typeCast: function (field, next) {
            // for reading from database
            if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
              return field.string();
            }
            return next();
          },
        },
        logging: false,
        timezone: CONFIG.timezone,
      }
    );
  }
  return { caelusInstance: caelusInstance, cirrusInstance: cirrusInstance };
};
const sequelizeErrorManagement = (error) => {
  if (error instanceof DBObjectNotFound) throw error;
  if (error instanceof Sequelize.ConnectionRefusedError)
    throw new DBConnexionRefused('Connexion to the database refused.');
  if (error instanceof Sequelize.ForeignKeyConstraintError)
    throw new DBForeignKeyConstraintError(
      'The foreign key cannot be deleted because it is still in use.'
    );
  if (error instanceof DBObjectNotFound)
    throw new DBObjectNotFound(error.message);
  throw error;
};

const db = {};
const cirrus = initModelsCirrus(getInstances().cirrusInstance);
const caelus = initModelsCaelus(getInstances().caelusInstance);

db.Sequelize = Sequelize;
db.sequelizeCirrus = getInstances().cirrusInstance;
db.sequelizeCaelus = getInstances().caelusInstance;
db.cirrus = cirrus;
db.caelus = caelus;
db.sequelizeErrorManagement = sequelizeErrorManagement;

export default db;
