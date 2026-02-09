import { MongoClient } from 'mongodb';
import CONFIG from './config.js';
import { MDBNotResponding } from '../utils/errors.util.js';

let client;
let db;
/**
 * Function that will get the instance from MDB to communicate with the MDB.
 * @returns
 */
export const getInstance = async function () {
  try {
    if (!client) {
      const url = `mongodb://${CONFIG.MONGODB_USERNAME}:${CONFIG.MONGODB_PASSWORD}@${CONFIG.MONGODB_URL}`;
      client = new MongoClient(url, {
        connectTimeoutMS: 10_000,
        socketTimeoutMS: 20_000,
        timeoutMS: 5_000,
      });
      await client.connect();
      db = client.db(CONFIG.MONGODB_DB);
    }
    return db;
  } catch (err) {
    throw new MDBNotResponding(err.message);
  }
};
