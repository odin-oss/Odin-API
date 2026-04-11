import z from 'zod';
import * as agent_builder from '../builders/agent.builder.js';
import Guard from '../utils/guard.util.js';
import { generateToken } from '../utils/token.util.js';
/**
 * Service that launchs the execution of agent creation.
 * @param {String} label label of the new agent to be created.
 * @param {String} type type of the new agent to be created.
 * @param {Function} fns functions to overwriting for tests purpose.
 * @returns {Agent}
 */
export const create = async function (
  props,
  fns = {
    agent_create: agent_builder.create,
  }
) {
  const schema = z.object({
    label: z.string().min(2),
    type: z.string().min(2),
  });
  const data = Guard.validateProps(schema, props);
  const agent = await fns.agent_create(data);
  agent.token = await generateToken({
    id_user: agent.id_agent,
    is_agent: true,
  });
  return agent;
};
