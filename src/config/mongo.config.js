import { MongoClient } from 'mongodb';
import CONFIG from './config.js';
import { MDBNotResponding } from '../utils/errors.util.js';

let client;
let db;
/**
 * Function that will get the instance from MDB to communicate with the MDB.
 * @returns {MongoClient}
 */
export const getInstance = async function () {
  if (CONFIG.MONGODB_ACTIVATED)
    try {
      if (!client) {
        const url = `mongodb://${CONFIG.MONGODB_USERNAME}:${CONFIG.MONGODB_PASSWORD}@${CONFIG.MONGODB_URL}`;
        client = new MongoClient(url, {
          connectTimeoutMS: 5_000,
          socketTimeoutMS: 10_000,
          timeoutMS: 5_000,
        });
        await client.connect();
        db = client.db(CONFIG.MONGODB_DB);
      }
      return db;
    } catch (err) {
      if (err.name === 'MongoServerSelectionError')
        throw new MDBNotResponding(
          'MongoDB unreachable: Check your URL/VPN/Firewall.'
        );
      else if (err.message.includes('Authentication failed'))
        throw new MDBNotResponding('MongoDB Auth: Wrong username or password.');
      else throw new MDBNotResponding(err.message);
    }
};
