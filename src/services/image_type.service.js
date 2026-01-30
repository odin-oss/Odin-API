import * as image_type_builder from '../builders/image_type.builder.js';

/**
 * Function that returns the list of Image_Type objects.
 * @param {*} fns overwriting functions for tests.
 * @returns [ImageType {}, ...]
 */
export const list = async function (
  fns = {
    image_type_list: image_type_builder.list,
  }
) {
  return await Promise.resolve(fns.image_type_list())
    .then((image_type) => {
      return image_type;
    })
    .catch((err) => {
      throw err;
    });
};
