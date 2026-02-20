import * as variableEnvironment_builder from '../builders/variableEnvironment.builder.js';
import VariableEnvironment from '../objects/Variable_environment.js';

/**
 * Listing all the VarEnvs.
 * @param {Function} fns overwriting functions for tests.
 * @returns {Array<VariableEnvironment>}
 */
export const list = async function (
    fns = {
        list: variableEnvironment_builder.list,
    }
) {
    return await fns.list();
};
