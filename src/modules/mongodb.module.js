import z from 'zod';
import * as mongodb from '../config/mongo.config.js';
import Guard from '../utils/guard.util.js';

/**
 * Function that will save a new application into the MDB collection.
 * @param {JSON} application application to save into the MDB collection.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {}
 */
export const saveApplication = async function (
  props,
  fns = {
    mongodb
  }
) {
  const schema = z.object({
    application: z.array(Object)
  });
  const data = Guard.validateProps(schema, props);
  const schema_app = z.object({
    hash: z.string().min(8).max(8)
  });
  const data_app = Guard.validateProps(schema_app, props);
  const mdb = await fns.mongodb.getInstance();
  const collection = mdb.collection('Applications');
  return await collection.insertOne({
    name: data_app.application.hash,
    value: data.application,
  });
};
/**
 * Function that will update the application from the MDB collection.
 * @param {String} hash unique hash to identify the application to update.
 * @param {String} state new state to put on the application.
 * @returns {}
 */
export const updateApplication = async function (
  props,
  fns = {
    mongodb,
  }
) {
  const schema = z.object({
    hash: z.string().min(8),
    state: z.enum(['started', 'shutted', 'Getting Ready'])
  });
  const data = Guard.validateProps(schema, props);
  const mdb = await fns.mongodb.getInstance();
  const collection = mdb.collection('Applications');
  const filter = { name: data.hash };
  const update = { $set: { state: data.state } };
  return await collection.updateOne(filter, update);
};
/**
 * Function that will delete the statefile from the MDB collection.
 * @param {String} hash unique hash to identify the application to delete. 
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {String}
 */
export const deleteApplication = async function (
  props,
  fns = {
    mongodb,
  }
) {
  const schema = z.object({
    hash: z.string().min(8)
  });
  const data = Guard.validateProps(schema, props);
  const mdb = await fns.mongodb.getInstance();
  const collection = mdb.collection('Applications');
  const filter = { name: data.hash };
  return await collection.deleteOne(filter).then((r) => {
    return r.deletedCount === 1
      ? 'The entry has been deleted from the mdb collection.'
      : 'The entry could not be found in the mdb collection.';
  });
};
