import * as mongodb from '../config/mongo.config.js';
import * as parametres from '../utils/parametres.service.js';
import {
  MissingArgumentError,
  ParameterMisformed,
} from '../utils/errors.service.js';

// Applications
/**
 * Function that will save a new application into the MDB collection.
 * @param {*} param0
 * @returns
 */
export const saveApplication = async function (
  props = { application: undefined },
  fns = {
    mdb_pkg: mongodb,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    application: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_JSON(props.application))
    throw new ParameterMisformed(
      `The props.application argument is not a JSON object.`
    );
  if (props.application.hash === undefined)
    throw new MissingArgumentError(
      `One or multiple arguments (props.application.hash) are missing.`
    );
  if (!parametres.check_hash(props.application.hash))
    throw new ParameterMisformed(
      `The props.application.hash parameter is misformed.`
    );

  const mdb = await fns.mdb_pkg.getInstance();
  const collection = mdb.collection('Applications');
  return await collection.insertOne({
    name: props.application.hash,
    value: props.application,
  });
};
/**
 * Function that will update the application from the MDB collection.
 * @param {*} param0
 * @returns
 */
export const updateApplication = async function (
  props = { hash: undefined, state: undefined },
  fns = {
    mdb_pkg: mongodb,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
    state: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');
  if (!['started', 'shutted', 'Getting Ready'].includes(props.state))
    throw new ParameterMisformed(
      'The props.state should be in [started,shutted,created]'
    );

  const mdb = await fns.mdb_pkg.getInstance();
  const collection = mdb.collection('Applications');

  const filter = { name: props.hash };
  const update = { $set: { state: props.state } };

  return await collection.updateOne(filter, update);
};
/**
 * Function that will delete the statefile from the MDB collection.
 * @param {*} param0
 * @returns
 */
export const deleteApplication = async function (
  props = { hash: undefined },
  fns = {
    mdb_pkg: mongodb,
  }
) {
  // We check all mandatory props before doing anything
  const expected_props = {
    hash: undefined,
  };
  if (parametres.check_props(expected_props, props).length > 0)
    throw new MissingArgumentError(
      `One or multiple arguments (${parametres.check_props(expected_props, props)}) are missing.`
    );
  if (!parametres.check_hash(props.hash))
    throw new ParameterMisformed('The props.hash parameter is misformed.');

  const mdb = await fns.mdb_pkg.getInstance();
  const collection = mdb.collection('Applications');

  const filter = { name: props.hash };

  return await collection.deleteOne(filter).then((r) => {
    return r.deletedCount === 1
      ? 'The entry has been deleted from the mdb collection.'
      : 'The entry could not be found in the mdb collection.';
  });
};
