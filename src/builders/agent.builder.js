import z from 'zod';
import dbManager from '../config/db.config.js';
import { DBObjectNotFound } from '../utils/errors.util.js';
import Guard from '../utils/guard.util.js';
import Agent, { Agent_type } from '../objects/Agent.js';

/**
 * Create an agent in the database
 * @param {String} label label of the agent
 * @param {String} type type of the agent
 * @returns { Agent }
 */
export const create = async function (props) {
  try {
    const schema = z.object({
      label: z.string().min(2),
      type: z.string().min(2),
    });
    const data = Guard.validateProps(schema, props);
    // We find the state from different parameters.
    const eat_options = {
      where: { label: 'Available' },
    };
    const status = await dbManager.models.ENUM_AGENT_TYPE.findOne(
      eat_options
    ).then((r) => {
      if (r == null)
        throw new DBObjectNotFound('The state could not be found.');
      return r;
    });

    // We prepare the creation of the agent
    const options = {
      ...data,
      id_enum_agent_type: status.id_enum_agent_type,
    };
    return await dbManager.models.AGENT.create(options).then((r) => {
      return new Agent({
        ...data,
        id_agent: r.id_agent,
        status: new Agent_type({
          id_enum_agent_type: status.id_enum_agent_type,
          label: status.label,
        }),
      });
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
