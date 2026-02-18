import * as image_type_builder from '../builders/image_type.builder.js';
import { ImageType } from '../objects/Image_type.js';

/**
 * Function that returns the list of Image_Type objects.
 * @param {Function} fns functions to overwrite for unit testing.
 * @returns {Array<ImageType>}
 */
export const list = async function (
  fns = { image_type_list: image_type_builder.list }
) {
  return await fns.image_type_list();
};
