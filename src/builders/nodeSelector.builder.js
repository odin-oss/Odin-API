import dbManager from '../config/db.config.js';
import NodeSelector from '../objects/NodeSelector.js';

/**
 * Getting all the node_selectors from database.
 * @returns {Array<NodeSelector}
 */
export const list = async function () {
    return await dbManager.models.NODE_SELECTOR.findAll()
        .then((result) => result.map((r) =>new NodeSelector(r.dataValues)))
        .catch((err) => {
            throw dbManager.sequelizeErrorManagement(err);
        });
};
