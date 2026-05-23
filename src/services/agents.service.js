import z from 'zod';
import * as agent_builder from '../builders/agent.builder.js';
import * as environment_builder from '../builders/environment.builder.js';
import * as application_builder from '../builders/applications.builder.js';
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
 * @param {Array} environments environments status of the agent
 * @returns {AgentPlan}
 */
export const up = async function ({ uuid, status, environments }) {
  const schema = z.object({
    uuid: z.string().uuid(),
    status: z.enum(['Alive', 'Reconciliating', 'Available', 'Attributed']),
    environments: z.array(
      z.object({
        hash: z.string(),
        status: z.string(),
      })
    ),
  });
  const data = Guard.validateProps(schema, { uuid, status, environments });
  // Getting the plan and storing the agent current status
  const plan = await agent_builder.up({ uuid: data.uuid, status: data.status });
  for (const i in plan.orders) {
    const env = plan.orders[i].template;
    plan.orders[i].template = await environment_builder.get({
      id_environment: env.id_environment,
    });
  }

  // Update the environments status of the agent
  for (const env of data.environments) {
    await application_builder.update_live_state({
      hash: env.hash,
      state_application: env.status,
      uuid: data.uuid,
    });
  }
  return plan;
};
