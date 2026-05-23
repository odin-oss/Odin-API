import z from 'zod';
import dbManager from '../config/db.config.js';
import { DBObjectNotFound } from '../utils/errors.util.js';
import Guard from '../utils/guard.util.js';
import Agent, { Agent_state } from '../objects/Agent.js';
import { Datacenter } from '../objects/Datacenter.js';
import {
  AgentPlan,
  AgentTemplate,
  AgentTemplateCustom,
} from '../objects/Agent_plan.js';
import { list } from './applications.builder.js';
import { Environment } from '../objects/Environment.js';

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
    const status = await dbManager.models.ENUM_AGENT_STATE.findOne(
      eat_options
    ).then((r) => {
      if (r == null)
        throw new DBObjectNotFound('The state could not be found.');
      return r;
    });

    // We prepare the creation of the agent
    const options = {
      ...data,
      id_enum_agent_state: status.id_enum_agent_state,
    };
    return await dbManager.models.AGENT.create(options).then((r) => {
      return new Agent({
        ...data,
        id_agent: r.id_agent,
        status: new Agent_state({
          id_enum_agent_state: status.id_enum_agent_state,
          label: status.label,
        }),
      });
    });
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};

/**
 * Get informations conerning the datacenter linked to the agent and the applications linked to this datacenter.
 * @param {String} uuid uuid of the agent
 * @param {String} status status of the agent
 * @returns {AgentPlan}
 */
export const up = async function (props = {}) {
  try {
    const schema = z.object({
      uuid: z.string().uuid(),
      status: z.enum(['Alive', 'Reconciliating', 'Available', 'Attributed']),
    });
    const data = Guard.validateProps(schema, props);
    const options = {
      where: { id_agent: data.uuid },
    };
    // We find the datacenter linked to the agent
    const datacenter = await dbManager.models.DATACENTER.findOne(options);
    if (datacenter == null)
      throw new DBObjectNotFound('No datacenter attributed to this agent.');

    // Get the id of the new Agent status
    const agent_status = await dbManager.models.ENUM_AGENT_STATE.findOne({
      where: { label: data.status },
    });
    if (agent_status == null)
      throw new DBObjectNotFound('The state could not be found.');

    // We find the applications linked to this datacenter
    const applications = await list({
      id_datacenter: datacenter.id_datacenter,
      states: ['Ready', 'Off', 'Getting ready', 'Deleted'],
    });
    const environments = [
      ...new Set(applications.map((app) => app.id_environment)),
    ];

    // We prepare the first plan of the agent with the applications and the environments linked to the datacenter
    const plan = new AgentPlan({
      orders: environments.map(
        (env) =>
          new AgentTemplate({
            namespaces: applications
              .filter((app) => app.id_environment === env)
              .map(
                (app) =>
                  new AgentTemplateCustom({
                    custom_label: app.custom_label,
                    generated_label: app.generated_label,
                    creation_date: app.creation_date,
                    hash: app.hash,
                    username: app.username,
                    password: app.password,
                    state_changed_date: app.state_changed_date,
                    state_application: app.state_application,
                  })
              ),
            template: new Environment({
              id_environment: applications.filter(
                (app) => app.id_environment === env
              )[0].environment.id_environment,
            }),
          })
      ),
    });

    return await dbManager.models.AGENT.update(
      {
        id_enum_agent_state: agent_status.id_enum_agent_state,
      },
      options
    ).then(() => plan);
  } catch (err) {
    throw dbManager.sequelizeErrorManagement(err);
  }
};
