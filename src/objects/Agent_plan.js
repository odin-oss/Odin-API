import z from 'zod';
import Guard from '../utils/guard.util.js';
import moment from 'moment-timezone';
import CONFIG from '../config/config.js';
import { id } from 'zod/locales';
import { Environment } from './Environment.js';
/**
 * Particular data to customize a template for a specific application.
 */
export class AgentTemplateCustom {
  #custom_label;
  #generated_label;
  #creation_date;
  #hash;
  #username;
  #password;
  #state_changed_date;
  #state_application;

  constructor(props) {
    const data = Guard.validateProps(AgentTemplateCustom.schema, props);
    this.#custom_label = data.custom_label;
    this.#generated_label = data.generated_label;
    this.#creation_date = data.creation_date;
    this.#hash = data.hash;
    this.#username = data.username;
    this.#password = data.password;
    this.#state_changed_date = data.state_changed_date;
    this.#state_application = data.state_application;
  }

  // Zod Schema for object validation
  static schema = z.object({
    custom_label: z.string().optional(),
    generated_label: z.string().optional(),
    creation_date: z
      .refine((val) => moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) => moment(val).tz(CONFIG.APP_TZ))
      .optional(),
    hash: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    state_changed_date: z
      .refine((val) => moment(val).isValid(), {
        message: 'Invalid date format',
      })
      .transform((val) => moment(val).tz(CONFIG.APP_TZ))
      .optional(),
    state_application: z.string().optional(),
  });

  toJSON() {
    return {
      custom_label: this.#custom_label,
      generated_label: this.#generated_label,
      creation_date: this.#creation_date,
      hash: this.#hash,
      username: this.#username,
      password: this.#password,
      state_changed_date: this.#state_changed_date,
      state_application: this.#state_application,
    };
  }
}

/**
 * Agent_template class represents the applications of a particular environment to be deployed by agent.
 */
export class AgentTemplate {
  #namespaces;
  #template;

  constructor(props) {
    const data = Guard.validateProps(AgentTemplate.schema, props);
    this.#namespaces = data.namespaces;
    this.#template = data.template;
  }

  // Zod Schema for object validation
  static schema = z.object({
    namespaces: z.array(z.instanceof(AgentTemplateCustom)).default([]),
    template: z
      .instanceof(Environment)
      .default(new Environment({ label: 'N/A' })),
  });

  get namespaces() {
    return this.#namespaces;
  }

  get template() {
    return this.#template;
  }

  set template(template) {
    if (template instanceof Environment) {
      this.#template = template;
    } else {
      throw new Error('Template must be an instance of Environment');
    }
  }

  toJSON() {
    return {
      namespaces: this.#namespaces.map((namespace) => namespace.toJSON()),
      template: this.#template.toJSON(),
    };
  }
}

/**
 * Agent_plan class represents the plan of an agent, which can be either 'Available' or 'Attributed'.
 * It includes a unique identifier and a label for the plan.
 * Source of truth for the agent plans.
 */
export class AgentPlan {
  #orders;

  constructor(props) {
    const data = Guard.validateProps(AgentPlan.schema, props);
    this.#orders = data.orders;
  }

  // Zod Schema for object validation
  static schema = z.object({
    orders: z.array(z.instanceof(AgentTemplate)).default([]),
  });

  get orders() {
    return this.#orders;
  }

  toJSON() {
    return {
      orders: this.#orders.map((order) => order.toJSON()),
    };
  }
}
