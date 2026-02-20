import * as nodeSelector_builder from '../builders/nodeSelector.builder.js';
import NodeSelector from '../objects/NodeSelector.js';

/**
 * Getting the list of all the NodeSelectors
 * @param {Function} fns overwriting functions for tests.
 * @returns {Array<NodeSelector>}
 */
export const list = async function (
    fns = {
        list: nodeSelector_builder.list,
    }
) {
    return await fns.list();
};
