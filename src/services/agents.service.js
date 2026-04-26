import z from 'zod';
import * as agent_builder from '../builders/agent.builder.js';
import * as environment_builder from '../builders/environment.builder.js';
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

/**
 * Ping up the agent and send back the plans template to be applied by the agent.
 * @param {String} uuid uuid of the agent
 * @param {String} status status of the agent
 * @returns {AgentPlan}
 */
export const up = async function ({ uuid, status }) {
  const schema = z.object({
    uuid: z.string().uuid(),
    status: z.enum(['Alive', 'Reconciliating', 'Available', 'Attributed']),
  });
  const data = Guard.validateProps(schema, { uuid, status });
  const plan = await agent_builder.up({ uuid: data.uuid, status: data.status });
  for (const i in plan.orders) {
    const env = plan.orders[i].template;
    plan.orders[i].template = await environment_builder.get({
      id_environment: env.id_environment,
    });
  }
  return plan;
};
