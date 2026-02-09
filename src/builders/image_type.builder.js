import dbManager from '../config/db.config.js';
import { ImageType } from '../objects/Image_type.js';

/**
 * Builder that fetches the db to get all the Image_type.
 * @param {*} fns
 * @returns
 */
export const list = async function () {
  return await dbManager.models.IMAGE_TYPE.findAll()
    .then((r) => {
      const result = [];
      for (let image_type of r) {
        result.push(
          new ImageType({
            id_type: image_type.id_type,
            label: image_type.label,
          })
        );
      }
      return result;
    })
    .catch((err) => {
      throw dbManager.sequelizeErrorManagement(err);
    });
};
