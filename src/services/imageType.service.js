import * as imageType_builder from '../builders/imageType.builder.js';

/**
 * Listing Image Types.
 * @param {Function} fns function to overwrite in test purpose.
 * @returns {Array<ImageType>}
 */
export const list = async function (fns = { list: imageType_builder.list }) {
    return await fns.list();
};
