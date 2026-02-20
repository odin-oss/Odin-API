import { ImageType } from '../objects/Image_type.js';
import dbManager from '../config/db.config.js';

/**
 * Listing Image_Types from database.
 * @param {Function} fns function to overwrite in test purpose.
 * @returns {Array<ImageType>}
 */
export const list = async function () {
  return dbManager.models.IMAGE_TYPE.findAll()
    .then((its) => its.map((it) => new ImageType(it)))
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};
