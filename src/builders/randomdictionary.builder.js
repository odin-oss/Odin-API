import db from '../config/db.config.js';
import { RandomDictionary } from '../objects/RandomDictionary.js';
/**
 * Builder that get the whole list of RandomDictionary words and send back a RandomDictionary object.
 * @param {*} fns
 * @returns
 */
export const list = async function () {
  return await Promise.resolve(db.caelus.RANDOM_DICTIONARY.findAll())
    .then((r) => {
      const dictionary = new RandomDictionary();
      for (const word of r) dictionary.add(word.word);
      return dictionary;
    })
    .catch((err) => {
      throw db.sequelizeErrorManagement(err);
    });
};
