import dbManager from '../config/db.config.js';
import { RandomDictionary } from '../objects/RandomDictionary.js';
/**
 * Builder that get the whole list of RandomDictionary words and send back a RandomDictionary object.
 * @param {*} fns
 * @returns
 */
export const list = async function () {
  return await dbManager.models.RANDOM_DICTIONARY.findAll()
    .then((r) => {
      const dictionary = new RandomDictionary();
      for (const word of r) dictionary.add(word.word);
      return dictionary;
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};
