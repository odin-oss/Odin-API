import z from 'zod';
import Guard from '../utils/guard.util.js';
import Agent from './Agent.js';

export class Datacenter {
  #id_datacenter;
  #label;
  #provider;
  #city;
  #agent;

  constructor(props) {
    const data = Guard.validateProps(Datacenter.schema, props);
    this.#id_datacenter = data.id_datacenter;
    this.#label = data.label;
    this.#provider = data.provider;
    this.#city = data.city;
    this.#agent = data.agent;
  }

  // Zod Schema for object validation
  static schema = z.object({
    id_datacenter: z.number().int().positive().optional(),
    label: z.string().min(1).trim().default(''),
    provider: z.string().min(1).trim().default(''),
    city: z.string().min(1).trim().default(''),
    agent: z.instanceof(Agent).default(new Agent({})),
  });

  // Getters
  get id_datacenter() {
    return this.#id_datacenter;
  }

  get label() {
    return this.#label;
  }

  get provider() {
    return this.#provider;
  }

  get city() {
    return this.#city;
  }

  get agent() {
    return this.#agent;
  }

  // Setters
  set id_datacenter(value) {
    this.#id_datacenter = value;
  }

  set label(value) {
    this.#label = value;
  }

  set provider(value) {
    this.#provider = value;
  }

  set city(value) {
    this.#city = value;
  }
  set agent(value) {
    this.#agent = value;
  }

  public_format() {
    const format = {
      id_datacenter: this.#id_datacenter,
      label: this.#label,
      provider: this.#provider,
      city: this.#city,
      agent: this.#agent.toJSON(),
    };
    return format;
  }

  toJSON() {
    return {
      id_datacenter: this.#id_datacenter,
      label: this.#label,
      provider: this.#provider,
      city: this.#city,
      agent: this.#agent.toJSON(),
    };
  }
}
