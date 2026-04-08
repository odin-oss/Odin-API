import z from 'zod';
import Guard from '../utils/guard.util.js';

/**
 * Agent_type class represents the type of an agent, which can be either 'Available' or 'Attributed'. It includes a unique identifier and a label for the type.
 */
export class Agent_type {
  #id_enum_agent_type;
  #label;

  constructor(props) {
    const data = Guard.validateProps(Agent_type.schema, props);
    this.#id_enum_agent_type = data.id_enum_agent_type;
    this.#label = data.label;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_enum_agent_type: z.number().int().default(null),
    label: z.string().min(2).default('N/A'),
  });

  toJSON() {
    return {
      id_enum_agent_type: this.#id_enum_agent_type,
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

  constructor(props) {
    const data = Guard.validateProps(Agent.schema, props);
    this.#id_agent = data.id_agent;
    this.#label = data.label;
    this.#type = data.type;
    this.#status = data.status;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_agent: z.string().uuid().default(null),
    label: z.string().min(2).default('N/A'),
    type: z.string().min(2).default('N/A'),
    status: z.instanceof(Agent_type).default(new Agent_type({})),
  });

  toJSON() {
    return {
      id_agent: this.#id_agent,
      label: this.#label,
      type: this.#type,
      status: this.#status.toJSON(),
    };
  }
}
