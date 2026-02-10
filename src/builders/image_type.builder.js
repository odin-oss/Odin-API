import dbManager from '../config/db.config.js';
import { ImageType } from '../objects/Image_type.js';

/**
 * Builder that fetches the db to get all the Image_type.
 * @returns {Array<ImageType>}
 */
export const list = async function () {
  return await dbManager.models.IMAGE_TYPE.findAll()
    .then((r) => r.map(image_type => new ImageType({ ...image_type })))
    .catch((err) => { throw dbManager.sequelizeErrorManagement(err) });
};
