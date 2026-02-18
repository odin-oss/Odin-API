import dbManager from '../config/db.config.js';
import { RandomDictionary } from '../objects/RandomDictionary.js';
/**
 * Builder that get the whole list of RandomDictionary words and send back a RandomDictionary object.
 * @returns {RandomDictionary}
 */
export const list = async function () {
  const dictionary = new RandomDictionary();
  return await dbManager.models.RANDOM_DICTIONARY.findAll()
    .then((r) => r.map((word) => dictionary.add(word.word)))
    .then(() => dictionary)
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};
