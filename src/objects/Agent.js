import z from 'zod';
import Guard from '../utils/guard.util.js';

/**
 * Agent_state class represents the state of an agent, which can be either 'Available' or 'Attributed'. It includes a unique identifier and a label for the state.
 */
export class Agent_state {
  #id_enum_agent_state;
  #label;

  constructor(props) {
    const data = Guard.validateProps(Agent_state.schema, props);
    this.#id_enum_agent_state = data.id_enum_agent_state;
    this.#label = data.label;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_enum_agent_state: z.number().int().default(null),
    label: z.string().min(2).default('N/A'),
  });

  toJSON() {
    return {
      id_enum_agent_state: this.#id_enum_agent_state,
      label: this.#label,
    };
  }
}

/**
 * Agent class represents an agent in the system, which can be either 'Available' or 'Attributed'.
 */
export default class Agent {
  #id_agent;
  #label;
  #type;
  #status;
  #token;

  constructor(props) {
    const data = Guard.validateProps(Agent.schema, props);
    this.#id_agent = data.id_agent;
    this.#label = data.label;
    this.#type = data.type;
    this.#status = data.status;
    this.#token = data.token;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_agent: z.string().uuid().default(null),
    label: z.string().min(2).default('N/A'),
    type: z.string().min(2).default('N/A'),
    status: z.instanceof(Agent_state).default(new Agent_state({})),
    token: z.string().min(2).default('N/A'),
  });

  get id_agent() {
    return this.#id_agent;
  }

  get token() {
    return this.#token;
  }

  get label() {
    return this.#label;
  }

  get type() {
    return this.#type;
  }

  get status() {
    return this.#status;
  }

  set token(token) {
    this.#token = token;
  }

  set status(status) {
    this.#status = status;
  }
  set type(type) {
    this.#type = type;
  }

  set label(label) {
    this.#label = label;
  }

  set id_agent(id_agent) {
    this.#id_agent = id_agent;
  }
  toJSON() {
    return {
      id_agent: this.#id_agent,
      label: this.#label,
      type: this.#type,
      status: this.#status.toJSON(),
    };
  }
}
